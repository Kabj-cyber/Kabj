package com.detour.api.payments.provider;

import com.detour.api.payments.Payment;
import com.detour.api.payments.PaymentStatus;
import com.detour.api.payments.config.PaymentProperties;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

@Component
public class MtnMomoGateway implements PaymentGateway {

    private final PaymentProperties properties;
    private final RestClient restClient;

    public MtnMomoGateway(PaymentProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    @Override
    public String getProvider() {
        return "MTN_MOMO";
    }

    @Override
    public PaymentInitResult initiate(Payment payment, String email) {
        PaymentProperties.MtnMomo config = properties.getMtnMomo();
        if (!config.isConfigured()) {
            return PaymentInitResult.failed("MTN MoMo is not configured. Set detour.payment.mtn-momo.* credentials.");
        }

        try {
            String reference = UUID.randomUUID().toString();
            String token = fetchAccessToken(config);
            String callbackUrl = properties.getCallbackBaseUrl() + "/api/payments/webhooks/mtn";

            restClient.post()
                    .uri(config.getBaseUrl() + "/collection/v1_0/requesttopay")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("X-Reference-Id", reference)
                    .header("X-Target-Environment", config.getTargetEnvironment())
                    .header("Ocp-Apim-Subscription-Key", config.getSubscriptionKey())
                    .header("X-Callback-Url", callbackUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "amount", payment.getAmount().toPlainString(),
                            "currency", config.getCurrency(),
                            "externalId", reference,
                            "payer", Map.of(
                                    "partyIdType", "MSISDN",
                                    "partyId", normalizePhone(payment.getPhoneNumber())
                            ),
                            "payerMessage", "DeTour booking payment",
                            "payeeNote", "Booking #" + payment.getBooking().getId()
                    ))
                    .retrieve()
                    .toBodilessEntity();

            return PaymentInitResult.processing(
                    reference,
                    "Check your phone for the MTN MoMo prompt and approve the payment."
            );
        } catch (Exception e) {
            return PaymentInitResult.failed("MTN MoMo request failed: " + e.getMessage());
        }
    }

    @Override
    public String checkStatus(Payment payment) {
        PaymentProperties.MtnMomo config = properties.getMtnMomo();
        if (payment.getExternalReference() == null || !config.isConfigured()) {
            return payment.getStatus();
        }

        try {
            String token = fetchAccessToken(config);
            @SuppressWarnings("unchecked")
            Map<String, Object> body = restClient.get()
                    .uri(config.getBaseUrl() + "/collection/v1_0/requesttopay/" + payment.getExternalReference())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("X-Target-Environment", config.getTargetEnvironment())
                    .header("Ocp-Apim-Subscription-Key", config.getSubscriptionKey())
                    .retrieve()
                    .body(Map.class);

            if (body == null) return payment.getStatus();
            return mapMtnStatus(String.valueOf(body.get("status")));
        } catch (Exception e) {
            return payment.getStatus();
        }
    }

    private String fetchAccessToken(PaymentProperties.MtnMomo config) {
        @SuppressWarnings("unchecked")
        Map<String, Object> body = restClient.post()
                .uri(config.getBaseUrl() + "/collection/token/")
                .header("Ocp-Apim-Subscription-Key", config.getSubscriptionKey())
                .header(HttpHeaders.AUTHORIZATION, "Basic " + basicAuth(config.getApiUser(), config.getApiKey()))
                .retrieve()
                .body(Map.class);

        if (body == null || body.get("access_token") == null) {
            throw new IllegalStateException("Could not obtain MTN MoMo access token");
        }
        return String.valueOf(body.get("access_token"));
    }

    private static String mapMtnStatus(String status) {
        return switch (status) {
            case "SUCCESSFUL" -> PaymentStatus.SUCCESS;
            case "FAILED" -> PaymentStatus.FAILED;
            case "PENDING" -> PaymentStatus.PROCESSING;
            default -> PaymentStatus.PROCESSING;
        };
    }

    private static String normalizePhone(String phone) {
        String digits = phone.replaceAll("\\D", "");
        if (digits.startsWith("0")) {
            return "233" + digits.substring(1);
        }
        if (!digits.startsWith("233")) {
            return "233" + digits;
        }
        return digits;
    }

    private static String basicAuth(String user, String key) {
        return java.util.Base64.getEncoder().encodeToString((user + ":" + key).getBytes());
    }
}
