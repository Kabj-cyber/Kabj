package com.detour.api.payments.provider;

public record PaystackTransferResult(
        boolean success,
        String message,
        String transferCode,
        String status
) {
    public static PaystackTransferResult ok(String transferCode, String status) {
        return new PaystackTransferResult(true, null, transferCode, status);
    }

    public static PaystackTransferResult failed(String message) {
        return new PaystackTransferResult(false, message, null, null);
    }
}
