package com.detour.api.payments.provider;

import com.detour.api.payments.Payment;
import com.detour.api.payments.PaymentMethod;
import com.detour.api.payments.PaymentStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SandboxPaymentGateway implements PaymentGateway {

    @Override
    public String getProvider() {
        return "SANDBOX";
    }

    @Override
    public PaymentInitResult initiate(Payment payment, String email) {
        String reference = "SANDBOX-" + UUID.randomUUID();
        String provider = payment.getProvider();

        if (PaymentMethod.CARD.equals(provider)) {
            return PaymentInitResult.pending(
                    reference,
                    "https://checkout.paystack.com/sandbox/" + reference,
                    "Open the payment page to complete your card payment."
            );
        }

        return PaymentInitResult.processing(
                reference,
                "A payment prompt has been sent to " + payment.getPhoneNumber()
                        + ". Approve it on your phone to complete payment."
        );
    }

    @Override
    public String checkStatus(Payment payment) {
        return payment.getStatus();
    }

    public String simulateSuccess(Payment payment) {
        return PaymentStatus.SUCCESS;
    }
}
