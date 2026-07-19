package com.detour.api.payments.provider;

import com.detour.api.payments.config.PaymentProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class PaystackTransferService {

    private final PaymentProperties properties;
    private final RestClient restClient;

    public PaystackTransferService(PaymentProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    public PaystackTransferResult resolveRecipientCode(
            String momoNumber,
            String telcoBankCode,
            String recipientName
    ) {
        PaymentProperties.Paystack config = properties.getPaystack();
        if (!config.isConfigured()) {
            return PaystackTransferResult.failed("Paystack is not configured. Set detour.payment.paystack.secret-key.");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = restClient.post()
                    .uri(config.getBaseUrl() + "/transferrecipient")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + config.getSecretKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "type", "mobile_money",
                            "name", recipientName,
                            "account_number", momoNumber,
                            "bank_code", telcoBankCode,
                            "currency", "GHS"
                    ))
                    .retrieve()
                    .body(Map.class);

            if (body == null || !Boolean.TRUE.equals(body.get("status"))) {
                String message = body != null ? String.valueOf(body.get("message")) : "Paystack recipient creation failed";
                return PaystackTransferResult.failed(message);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            if (data == null || data.get("recipient_code") == null) {
                return PaystackTransferResult.failed("Paystack returned no recipient code");
            }

            return PaystackTransferResult.ok(String.valueOf(data.get("recipient_code")), null);
        } catch (Exception e) {
            return PaystackTransferResult.failed("Recipient creation failed: " + e.getMessage());
        }
    }

    public PaystackTransferResult initiateTransfer(
            String recipientCode,
            BigDecimal amountGhs,
            String reason,
            String reference
    ) {
        PaymentProperties.Paystack config = properties.getPaystack();
        if (!config.isConfigured()) {
            return PaystackTransferResult.failed("Paystack is not configured. Set detour.payment.paystack.secret-key.");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = restClient.post()
                    .uri(config.getBaseUrl() + "/transfer")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + config.getSecretKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "source", "balance",
                            "amount", amountGhs.multiply(BigDecimal.valueOf(100)).intValue(),
                            "recipient", recipientCode,
                            "reason", reason,
                            "reference", reference,
                            "currency", "GHS"
                    ))
                    .retrieve()
                    .body(Map.class);

            if (body == null || !Boolean.TRUE.equals(body.get("status"))) {
                String message = body != null ? String.valueOf(body.get("message")) : "Paystack transfer initiation failed";
                return PaystackTransferResult.failed(message);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            if (data == null) {
                return PaystackTransferResult.failed("Paystack returned no transfer data");
            }

            String transferReference = data.get("reference") != null
                    ? String.valueOf(data.get("reference"))
                    : reference;
            String transferCode = data.get("transfer_code") != null
                    ? String.valueOf(data.get("transfer_code"))
                    : transferReference;
            String status = data.get("status") != null ? String.valueOf(data.get("status")) : "pending";

            return PaystackTransferResult.ok(transferReference, status);
        } catch (Exception e) {
            return PaystackTransferResult.failed("Transfer initiation failed: " + e.getMessage());
        }
    }
}
