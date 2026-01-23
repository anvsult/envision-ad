package com.envisionad.webservice.payment.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, Long> {
    Optional<PaymentIntent> findByStripePaymentIntentId(String stripePaymentIntentId);
    Optional<PaymentIntent> findByReservationId(String reservationId);
    Optional<PaymentIntent> findByStripeSessionId(String stripeSessionId);
}
