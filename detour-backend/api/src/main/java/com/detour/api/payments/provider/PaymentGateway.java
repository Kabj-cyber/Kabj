package com.detour.api.payments.provider;

import com.detour.api.payments.Payment;

public interface PaymentGateway {

    String getProvider();

    PaymentInitResult initiate(Payment payment, String email);

    String checkStatus(Payment payment);
}
