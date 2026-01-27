package com.envisionad.webservice.payment.presentationlayer;

import com.envisionad.webservice.payment.businesslogiclayer.StripeWebhookService;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeWebhookServiceTest {

    @Mock
    private PaymentIntentRepository paymentIntentRepository;

    @Mock
    private StripeAccountRepository stripeAccountRepository;

    @Test
    void handleCheckoutSessionCompleted_updatesPaymentIntent() {
        StripeWebhookService service = new StripeWebhookService(paymentIntentRepository, stripeAccountRepository);

        com.stripe.model.EventDataObjectDeserializer deserializer = mock(com.stripe.model.EventDataObjectDeserializer.class);

        com.stripe.model.Event event = mock(com.stripe.model.Event.class);
        when(event.getType()).thenReturn("checkout.session.completed");
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

        com.stripe.model.checkout.Session session = mock(com.stripe.model.checkout.Session.class);
        when(session.getId()).thenReturn("sess_123");
        when(session.getPaymentIntent()).thenReturn("pi_123");

        when(deserializer.getObject()).thenReturn(java.util.Optional.of(session));

        com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent pi = new com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent();
        pi.setReservationId("res-1");
        pi.setStripeSessionId("sess_123");
        pi.setStripePaymentIntentId(null);
        pi.setStatus(com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus.PENDING);

        when(paymentIntentRepository.findByStripeSessionId("sess_123")).thenReturn(Optional.of(pi));

        service.handleEvent(event);

        verify(paymentIntentRepository, times(1)).save(any());
    }

    @Test
    void handlePaymentIntentSucceeded_marksSucceeded() {
        StripeWebhookService service = new StripeWebhookService(paymentIntentRepository, stripeAccountRepository);

        com.stripe.model.EventDataObjectDeserializer deserializer = mock(com.stripe.model.EventDataObjectDeserializer.class);

        com.stripe.model.Event event = mock(com.stripe.model.Event.class);
        when(event.getType()).thenReturn("payment_intent.succeeded");
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

        com.stripe.model.PaymentIntent stripePi = mock(com.stripe.model.PaymentIntent.class);
        when(stripePi.getId()).thenReturn("pi_123");

        when(deserializer.getObject()).thenReturn(java.util.Optional.of(stripePi));

        com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent pi = new com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent();
        pi.setStripePaymentIntentId("pi_123");
        pi.setStatus(com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus.PENDING);

        when(paymentIntentRepository.findByStripePaymentIntentId("pi_123")).thenReturn(Optional.of(pi));

        service.handleEvent(event);

        verify(paymentIntentRepository, times(1)).save(any());
    }
}
