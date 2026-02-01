package com.envisionad.webservice.payment.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, Long> {
        Optional<PaymentIntent> findByStripePaymentIntentId(String stripePaymentIntentId);

        Optional<PaymentIntent> findByReservationId(String reservationId);

        Optional<PaymentIntent> findByStripeSessionId(String stripeSessionId);

        @Query("SELECT p FROM PaymentIntent p WHERE p.businessId = :businessId " +
                        "AND p.status = com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus.SUCCEEDED " +
                        "AND p.createdAt >= :startDate AND p.createdAt <= :endDate")
        List<PaymentIntent> findSuccessfulPaymentsByBusinessIdAndDateRange(
                        @Param("businessId") String businessId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT p FROM PaymentIntent p JOIN Reservation r ON p.reservationId = r.reservationId " +
                        "WHERE r.advertiserId = :businessId " +
                        "AND p.status = com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus.SUCCEEDED " +
                        "AND p.createdAt >= :startDate AND p.createdAt <= :endDate")
        List<PaymentIntent> findSuccessfulPaymentsByAdvertiserIdAndDateRange(
                        @Param("businessId") String businessId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}
