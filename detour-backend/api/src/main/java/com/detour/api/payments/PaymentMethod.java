package com.detour.api.payments;

public final class PaymentMethod {

    public static final String MTN_MOMO = "MTN_MOMO";
    public static final String VODAFONE_CASH = "VODAFONE_CASH";
    public static final String CARD = "CARD";

    private PaymentMethod() {}

    public static boolean isValid(String method) {
        return MTN_MOMO.equals(method) || VODAFONE_CASH.equals(method) || CARD.equals(method);
    }
}
