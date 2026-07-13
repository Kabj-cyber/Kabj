package com.detour.api.payments.provider;

import com.detour.api.payments.Payment;
import com.detour.api.payments.PaymentStatus;
import com.detour.api.payments.config.PaymentProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Component
public class VodafoneCashGateway implements PaymentGateway {

    private final PaymentProperties properties;
    private final RestClient restClient;

    public VodafoneCashGateway(PaymentProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    @Override
    public String getProvider() {
        return "VODAFONE_CASH";
    }

    @Override
    public PaymentInitResult initiate(Payment payment, String email) {
        PaymentProperties.VodafoneCash config = properties.getVodafoneCash();
        if (!config.isConfigured()) {
            return PaymentInitResult.failed("Vodafone Cash is not configured. Set detour.payment.vodafone-cash.* credentials.");
        }

        try {
            String reference = "VF-" + UUID.randomUUID();
            String callbackUrl = properties.getCallbackBaseUrl() + "/api/payments/webhooks/vodafone";

            @SuppressWarnings("unchecked")
            Map<String, Object> body = restClient.post()
                    .uri(config.getBaseUrl() + "/v2/pos/onlinecheckout/items/initiate")
                    .header(HttpHeaders.AUTHORIZATION, basicAuth(config.getClientId(), config.getClientSecret()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "totalAmount", payment.getAmount(),
                            "description", "DeTour booking #" + payment.getBooking().getId(),
                            "callbackUrl", callbackUrl,
                            "returnUrl", callbackUrl,
                            "cancellationUrl", callbackUrl,
                            "merchantAccountNumber", config.getMerchantAccountNumber(),
                            "clientReference", reference,
                            "payeeName", "DeTour",
                            "payeeMobileNumber", normalizePhone(payment.getPhoneNumber())
                    ))
                    .retrieve()
                    .body(Map.class);

            if (body == null) {
                return PaymentInitResult.failed("Empty response from Vodafone Cash provider");
            }

            String checkoutUrl = body.get("checkoutUrl") != null
                    ? String.valueOf(body.get("checkoutUrl"))
                    : null;

            return PaymentInitResult.processing(
                    reference,
                    checkoutUrl != null
                            ? "Complete Vodafone Cash payment on the checkout page."
                            : "Check your phone for the Vodafone Cash prompt and approve the payment."
            );
        } catch (Exception e) {
            return PaymentInitResult.failed("Vodafone Cash request failed: " + e.getMessage());
        }
    }

    @Override
    public String checkStatus(Payment payment) {
        // Hubtel/Vodafone status is typically confirmed via webhook callback
        return payment.getStatus();
    }

    public String mapWebhookStatus(String status) {
        return switch (status.toLowerCase()) {
            case "success", "paid", "completed" -> PaymentStatus.SUCCESS;
            case "failed", "cancelled", "canceled" -> PaymentStatus.FAILED;
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

    private static String basicAuth(String clientId, String clientSecret) {
        String token = clientId + ":" + clientSecret;
        return "Basic " + Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }
}
