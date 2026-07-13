package com.detour.api.payments.dto;

public class InitiatePaymentRequest {
    public Integer bookingId;
    public String method;
    public String phoneNumber;
    public String email;
}
