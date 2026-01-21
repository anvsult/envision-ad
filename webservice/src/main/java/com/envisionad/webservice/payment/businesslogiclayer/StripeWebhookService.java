package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
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
     * Handle successful payment intent
     */
    private void handlePaymentIntentSucceeded(Event event) {
        try {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;

            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            }

            if (stripeObject instanceof com.stripe.model.PaymentIntent) {
                com.stripe.model.PaymentIntent stripePaymentIntent = (com.stripe.model.PaymentIntent) stripeObject;

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

            if (stripeObject instanceof com.stripe.model.PaymentIntent) {
                com.stripe.model.PaymentIntent stripePaymentIntent = (com.stripe.model.PaymentIntent) stripeObject;

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

            if (stripeObject instanceof com.stripe.model.PaymentIntent) {
                com.stripe.model.PaymentIntent stripePaymentIntent = (com.stripe.model.PaymentIntent) stripeObject;

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

