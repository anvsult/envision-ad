package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service to handle Stripe webhook events
 * Processes payment status updates and other Stripe events
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookService {

    private final PaymentIntentRepository paymentIntentRepository;

    /**
     * Handle incoming Stripe webhook events
     * @param event The Stripe event to process
     */
    @Transactional
    public void handleEvent(Event event) {
        log.info("Processing Stripe webhook event: {}", event.getType());

        switch (event.getType()) {
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
            case "payment_intent.canceled":
                handlePaymentIntentCanceled(event);
                break;
            case "account.updated":
                handleAccountUpdated(event);
                break;
            default:
                log.warn("Unhandled event type: {}", event.getType());
        }
    }

    /**
     * Handle successful checkout session completion
     * Links session ID to payment intent ID when payment completes
     */
    private void handleCheckoutSessionCompleted(Event event) {
        try {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;

            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            }

            if (stripeObject instanceof Session session) {

                log.info("Checkout session completed: {}", session.getId());

                // Link the session with its payment intent
                String paymentIntentId = session.getPaymentIntent();
                if (paymentIntentId == null) {
                    log.error("checkout.session.completed missing payment_intent for session: {}", session.getId());
                    return;
                }

                // Find by session ID and update with payment intent ID
                paymentIntentRepository.findByStripeSessionId(session.getId())
                    .ifPresentOrElse(paymentIntent -> {
                        paymentIntent.setStripePaymentIntentId(paymentIntentId);
                        paymentIntent.setStatus(PaymentStatus.SUCCEEDED);
                        paymentIntent.setUpdatedAt(LocalDateTime.now());
                        paymentIntentRepository.save(paymentIntent);
                        log.info("Payment intent updated to SUCCEEDED for reservation: {} (session: {}, payment_intent: {})",
                                 paymentIntent.getReservationId(), session.getId(), paymentIntentId);
                    }, () -> log.warn("No payment record found for session: {}", session.getId()));
            }
        } catch (Exception e) {
            log.error("Error processing checkout.session.completed event", e);
            throw new RuntimeException("Failed to process checkout session completion", e);
        }
    }

    /**
     * Handle successful payment intent
     */
    private void handlePaymentIntentSucceeded(Event event) {
        try {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;

            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            }

            if (stripeObject instanceof com.stripe.model.PaymentIntent stripePaymentIntent) {

                PaymentIntent paymentIntent = paymentIntentRepository
                        .findByStripePaymentIntentId(stripePaymentIntent.getId())
                        .orElse(null);

                if (paymentIntent != null) {
                    paymentIntent.setStatus(PaymentStatus.SUCCEEDED);
                    paymentIntent.setUpdatedAt(LocalDateTime.now());
                    paymentIntentRepository.save(paymentIntent);
                    log.info("Payment intent {} marked as SUCCEEDED", stripePaymentIntent.getId());
                } else {
                    log.warn("Payment intent not found in database: {}", stripePaymentIntent.getId());
                }
            }
        } catch (Exception e) {
            log.error("Error processing payment_intent.succeeded event", e);
            throw new RuntimeException("Failed to process payment success", e);
        }
    }

    /**
     * Handle failed payment intent
     */
    private void handlePaymentIntentFailed(Event event) {
        try {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;

            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            }

            if (stripeObject instanceof com.stripe.model.PaymentIntent stripePaymentIntent) {

                PaymentIntent paymentIntent = paymentIntentRepository
                        .findByStripePaymentIntentId(stripePaymentIntent.getId())
                        .orElse(null);

                if (paymentIntent != null) {
                    paymentIntent.setStatus(PaymentStatus.FAILED);
                    paymentIntent.setUpdatedAt(LocalDateTime.now());
                    paymentIntentRepository.save(paymentIntent);
                    log.info("Payment intent {} marked as FAILED", stripePaymentIntent.getId());
                } else {
                    log.warn("Payment intent not found in database: {}", stripePaymentIntent.getId());
                }
            }
        } catch (Exception e) {
            log.error("Error processing payment_intent.payment_failed event", e);
            throw new RuntimeException("Failed to process payment failure", e);
        }
    }

    /**
     * Handle canceled payment intent
     */
    private void handlePaymentIntentCanceled(Event event) {
        try {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;

            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            }

            if (stripeObject instanceof com.stripe.model.PaymentIntent stripePaymentIntent) {

                PaymentIntent paymentIntent = paymentIntentRepository
                        .findByStripePaymentIntentId(stripePaymentIntent.getId())
                        .orElse(null);

                if (paymentIntent != null) {
                    paymentIntent.setStatus(PaymentStatus.CANCELED);
                    paymentIntent.setUpdatedAt(LocalDateTime.now());
                    paymentIntentRepository.save(paymentIntent);
                    log.info("Payment intent {} marked as CANCELED", stripePaymentIntent.getId());
                } else {
                    log.warn("Payment intent not found in database: {}", stripePaymentIntent.getId());
                }
            }
        } catch (Exception e) {
            log.error("Error processing payment_intent.canceled event", e);
            throw new RuntimeException("Failed to process payment cancellation", e);
        }
    }

    /**
     * Handle Stripe account updates
     */
    private void handleAccountUpdated(Event event) {
        // TODO: Implement account update logic if needed
        log.info("Account updated event received - implement if needed");
    }
}

