package com.detour.api.payments.provider;

import com.detour.api.payments.Payment;

public record PaymentInitResult(
        String status,
        String externalReference,
        String authorizationUrl,
        String message
) {
    public static PaymentInitResult processing(String reference, String message) {
        return new PaymentInitResult("PROCESSING", reference, null, message);
    }

    public static PaymentInitResult pending(String reference, String authorizationUrl, String message) {
        return new PaymentInitResult("PENDING", reference, authorizationUrl, message);
    }

    public static PaymentInitResult failed(String message) {
        return new PaymentInitResult("FAILED", null, null, message);
    }
}
