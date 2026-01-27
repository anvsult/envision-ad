// java
package com.envisionad.webservice.payment.presentationlayer;

import com.envisionad.webservice.payment.businesslogiclayer.StripeWebhookService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/webhooks", produces = "application/json")
public class WebhookController {
    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final StripeWebhookService webhookService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public WebhookController(StripeWebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping(value = "/stripe", produces = "application/json")
    public ResponseEntity<?> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            webhookService.handleEvent(event);
            return ResponseEntity.ok(Collections.singletonMap("status", "processed"));
        } catch (SignatureVerificationException e) {
            String errorId = UUID.randomUUID().toString();
            log.warn("Invalid Stripe signature (errorId={}): {}", errorId, e.getMessage());
            ErrorResponse resp = new ErrorResponse(Instant.now(), "invalid_signature", "Invalid signature", errorId);
            return ResponseEntity.status(400).body(resp);
        } catch (Exception e) {
            String errorId = UUID.randomUUID().toString();
            log.error("Webhook processing failed (errorId={}): {}", errorId, e.getMessage(), e);
            ErrorResponse resp = new ErrorResponse(Instant.now(), "internal_error", "Webhook processing failed", errorId);
            return ResponseEntity.status(500).body(resp);
        }
    }
}
