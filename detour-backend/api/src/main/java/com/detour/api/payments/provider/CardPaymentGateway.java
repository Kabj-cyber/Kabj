package com.detour.api.payments.provider;

import com.detour.api.payments.Payment;
import com.detour.api.payments.PaymentStatus;
import com.detour.api.payments.config.PaymentProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

@Component
public class CardPaymentGateway implements PaymentGateway {

    private final PaymentProperties properties;
    private final RestClient restClient;

    public CardPaymentGateway(PaymentProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    @Override
    public String getProvider() {
        return "CARD";
    }

    @Override
    public PaymentInitResult initiate(Payment payment, String email) {
        PaymentProperties.Paystack config = properties.getPaystack();
        if (!config.isConfigured()) {
            return PaymentInitResult.failed("Card payments are not configured. Set detour.payment.paystack.secret-key.");
        }

        if (email == null || email.isBlank()) {
            return PaymentInitResult.failed("Email is required for card payments.");
        }

        try {
            String reference = "DT-" + UUID.randomUUID();
            String callbackUrl = properties.getCallbackBaseUrl() + "/api/payments/webhooks/card";

            @SuppressWarnings("unchecked")
            Map<String, Object> body = restClient.post()
                    .uri(config.getBaseUrl() + "/transaction/initialize")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + config.getSecretKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "email", email,
                            "amount", payment.getAmount().multiply(java.math.BigDecimal.valueOf(100)).intValue(),
                            "currency", payment.getCurrency(),
                            "reference", reference,
                            "callback_url", callbackUrl,
                            "metadata", Map.of(
                                    "booking_id", payment.getBooking().getId(),
                                    "payment_id", payment.getId() != null ? payment.getId() : 0
                            )
                    ))
                    .retrieve()
                    .body(Map.class);

            if (body == null || !Boolean.TRUE.equals(body.get("status"))) {
                return PaymentInitResult.failed("Paystack initialization failed");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            if (data == null) {
                return PaymentInitResult.failed("Paystack returned no checkout data");
            }

            return PaymentInitResult.pending(
                    String.valueOf(data.get("reference")),
                    String.valueOf(data.get("authorization_url")),
                    "Complete your card payment on the secure checkout page."
            );
        } catch (Exception e) {
            return PaymentInitResult.failed("Card payment initialization failed: " + e.getMessage());
        }
    }

    @Override
    public String checkStatus(Payment payment) {
        PaymentProperties.Paystack config = properties.getPaystack();
        if (payment.getExternalReference() == null || !config.isConfigured()) {
            return payment.getStatus();
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = restClient.get()
                    .uri(config.getBaseUrl() + "/transaction/verify/" + payment.getExternalReference())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + config.getSecretKey())
                    .retrieve()
                    .body(Map.class);

            if (body == null || !Boolean.TRUE.equals(body.get("status"))) {
                return payment.getStatus();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            if (data == null) return payment.getStatus();

            return "success".equalsIgnoreCase(String.valueOf(data.get("status")))
                    ? PaymentStatus.SUCCESS
                    : PaymentStatus.FAILED;
        } catch (Exception e) {
            return payment.getStatus();
        }
    }
}
