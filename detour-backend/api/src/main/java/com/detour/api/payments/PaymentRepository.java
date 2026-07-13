package com.detour.api.payments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    List<Payment> findByBookingIdOrderByCreatedAtDesc(Integer bookingId);

    Optional<Payment> findByExternalReference(String externalReference);
}
