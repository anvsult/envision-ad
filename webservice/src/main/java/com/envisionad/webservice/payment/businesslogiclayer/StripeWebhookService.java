package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
public class StripeWebhookService {

    private final PaymentIntentRepository paymentIntentRepository;
    private final ReservationRepository reservationRepository;

    public StripeWebhookService(PaymentIntentRepository paymentIntentRepository,
                                ReservationRepository reservationRepository) {
        this.paymentIntentRepository = paymentIntentRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional
    public void handleCheckoutSessionCompleted(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

        if (dataObjectDeserializer.getObject().isEmpty()) {
            log.error("Unable to deserialize checkout.session.completed event");
            return;
        }

        StripeObject stripeObject = dataObjectDeserializer.getObject().get();
        if (!(stripeObject instanceof Session session)) {
            log.error("Event object is not a Session");
            return;
        }

        String sessionId = session.getId();
        String paymentIntentId = session.getPaymentIntent();

        log.info("Checkout session completed: sessionId={}, paymentIntentId={}",
                sessionId, paymentIntentId);

        // Update our payment record with the PaymentIntent ID
        Optional<PaymentIntent> paymentOpt = paymentIntentRepository.findByStripeSessionId(sessionId);

        if (paymentOpt.isEmpty()) {
            log.warn("No payment record found for session: {}", sessionId);
            return;
        }

        PaymentIntent payment = paymentOpt.get();
        payment.setStripePaymentIntentId(paymentIntentId);
        payment.setStatus(PaymentStatus.SUCCEEDED);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentIntentRepository.save(payment);

        log.info("Updated payment record: reservationId={}, status=SUCCEEDED",
                payment.getReservationId());

        // Update reservation status to CONFIRMED
        updateReservationStatus(payment.getReservationId(), ReservationStatus.CONFIRMED);
    }

    @Transactional
    public void handlePaymentIntentSucceeded(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

        if (dataObjectDeserializer.getObject().isEmpty()) {
            log.error("Unable to deserialize payment_intent.succeeded event");
            return;
        }

        StripeObject stripeObject = dataObjectDeserializer.getObject().get();
        if (!(stripeObject instanceof com.stripe.model.PaymentIntent stripePaymentIntent)) {
            log.error("Event object is not a PaymentIntent");
            return;
        }

        String paymentIntentId = stripePaymentIntent.getId();

        log.info("Payment intent succeeded: paymentIntentId={}", paymentIntentId);

        // Find and update payment record
        Optional<PaymentIntent> paymentOpt = paymentIntentRepository.findByStripePaymentIntentId(paymentIntentId);

        if (paymentOpt.isPresent()) {
            PaymentIntent payment = paymentOpt.get();
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentIntentRepository.save(payment);

            log.info("Updated payment record from webhook: reservationId={}",
                    payment.getReservationId());

            // Update reservation status to CONFIRMED
            updateReservationStatus(payment.getReservationId(), ReservationStatus.CONFIRMED);
        } else {
            log.warn("No payment record found for PaymentIntent: {}", paymentIntentId);
        }
    }

    @Transactional
    public void handlePaymentIntentFailed(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

        if (dataObjectDeserializer.getObject().isEmpty()) {
            log.error("Unable to deserialize payment_intent.payment_failed event");
            return;
        }

        StripeObject stripeObject = dataObjectDeserializer.getObject().get();
        if (!(stripeObject instanceof com.stripe.model.PaymentIntent stripePaymentIntent)) {
            log.error("Event object is not a PaymentIntent");
            return;
        }

        String paymentIntentId = stripePaymentIntent.getId();

        log.info("Payment intent failed: paymentIntentId={}", paymentIntentId);

        // Find and update payment record
        Optional<PaymentIntent> paymentOpt = paymentIntentRepository.findByStripePaymentIntentId(paymentIntentId);

        if (paymentOpt.isPresent()) {
            PaymentIntent payment = paymentOpt.get();
            payment.setStatus(PaymentStatus.FAILED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentIntentRepository.save(payment);

            log.info("Marked payment as failed: reservationId={}", payment.getReservationId());

            // Update reservation status to FAILED
            updateReservationStatus(payment.getReservationId(), ReservationStatus.CANCELLED);
        } else {
            log.warn("No payment record found for PaymentIntent: {}", paymentIntentId);
        }
    }

    private void updateReservationStatus(String reservationId, ReservationStatus newStatus) {
        Optional<Reservation> reservationOpt = reservationRepository.findByReservationId(reservationId);

        if (reservationOpt.isEmpty()) {
            log.warn("Reservation not found for payment update: {}", reservationId);
            return;
        }

        Reservation reservation = reservationOpt.get();
        ReservationStatus oldStatus = reservation.getStatus();

        // Only update if status is changing
        if (oldStatus != newStatus) {
            reservation.setStatus(newStatus);
            reservationRepository.save(reservation);
            log.info("Updated reservation status: id={}, {} -> {}",
                    reservationId, oldStatus, newStatus);
        } else {
            log.debug("Reservation already has status {}: {}", newStatus, reservationId);
        }
    }
}