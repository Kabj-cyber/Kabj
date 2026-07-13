package com.detour.api.payments.dto;

import com.detour.api.payments.Payment;
import java.math.BigDecimal;

public class PaymentResponse {
    public Integer id;
    public Integer bookingId;
    public String provider;
    public BigDecimal amount;
    public String currency;
    public String status;
    public String phoneNumber;
    public String externalReference;
    public String authorizationUrl;
    public String failureReason;
    public boolean sandbox;
    public String message;

    public static PaymentResponse from(Payment payment, boolean sandbox, String message) {
        PaymentResponse r = new PaymentResponse();
        r.id = payment.getId();
        r.bookingId = payment.getBooking().getId();
        r.provider = payment.getProvider();
        r.amount = payment.getAmount();
        r.currency = payment.getCurrency();
        r.status = payment.getStatus();
        r.phoneNumber = payment.getPhoneNumber();
        r.externalReference = payment.getExternalReference();
        r.authorizationUrl = payment.getAuthorizationUrl();
        r.failureReason = payment.getFailureReason();
        r.sandbox = sandbox;
        r.message = message;
        return r;
    }
}
