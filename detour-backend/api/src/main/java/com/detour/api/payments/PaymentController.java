package com.detour.api.payments;

import com.detour.api.payments.dto.InitiatePaymentRequest;
import com.detour.api.payments.dto.PaymentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody InitiatePaymentRequest request) {
        try {
            return ResponseEntity.ok(paymentService.initiatePayment(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(@PathVariable Integer paymentId) {
        try {
            return ResponseEntity.ok(paymentService.getPayment(paymentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{paymentId}/status")
    public ResponseEntity<?> refreshPaymentStatus(@PathVariable Integer paymentId) {
        try {
            return ResponseEntity.ok(paymentService.refreshPaymentStatus(paymentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsForBooking(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsForBooking(bookingId));
    }

    @PostMapping("/{paymentId}/confirm")
    public ResponseEntity<?> confirmSandboxPayment(@PathVariable Integer paymentId) {
        try {
            return ResponseEntity.ok(paymentService.confirmSandboxPayment(paymentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/webhooks/mtn")
    public ResponseEntity<Void> mtnWebhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleWebhook("mtn", payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhooks/vodafone")
    public ResponseEntity<Void> vodafoneWebhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleWebhook("vodafone", payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhooks/card")
    public ResponseEntity<Void> cardWebhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleWebhook("card", payload);
        return ResponseEntity.ok().build();
    }
}
