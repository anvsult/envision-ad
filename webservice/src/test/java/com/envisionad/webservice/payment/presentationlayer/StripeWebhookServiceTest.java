package com.envisionad.webservice.payment.presentationlayer;

import com.envisionad.webservice.payment.businesslogiclayer.StripeWebhookService;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeWebhookServiceTest {

    @InjectMocks
    private StripeWebhookService stripeWebhookService;

    @Mock
    private PaymentIntentRepository paymentIntentRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private Event event;

    @Mock
    private EventDataObjectDeserializer deserializer;

    private static final String SESSION_ID = "sess_123456";
    private static final String PAYMENT_INTENT_ID = "pi_3QfRBWHI4UD28XdL0H0YVZTa";
    private static final String RESERVATION_ID = "res_550e8400-e29b-41d4-a716-446655440000";

    @BeforeEach
    void setUp() {
        reset(paymentIntentRepository, reservationRepository, event, deserializer);
    }

    // ==================== handleCheckoutSessionCompleted Tests ====================

    @Test
    void whenHandleCheckoutSessionCompleted_withValidSession_thenUpdatePaymentAndReservation() {
        // Arrange
        Session session = mock(Session.class);
        when(session.getId()).thenReturn(SESSION_ID);
        when(session.getPaymentIntent()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(session));

        PaymentIntent payment = createPaymentIntent();
        payment.setStripeSessionId(SESSION_ID);
        payment.setStatus(PaymentStatus.PENDING);

        Reservation reservation = createReservation();
        reservation.setStatus(ReservationStatus.PENDING);

        when(paymentIntentRepository.findByStripeSessionId(SESSION_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));

        // Act
        stripeWebhookService.handleCheckoutSessionCompleted(event);

        // Assert
        ArgumentCaptor<PaymentIntent> paymentCaptor = ArgumentCaptor.forClass(PaymentIntent.class);
        verify(paymentIntentRepository).save(paymentCaptor.capture());

        PaymentIntent savedPayment = paymentCaptor.getValue();
        assertEquals(PAYMENT_INTENT_ID, savedPayment.getStripePaymentIntentId());
        assertEquals(PaymentStatus.SUCCEEDED, savedPayment.getStatus());
        assertNotNull(savedPayment.getUpdatedAt());

        ArgumentCaptor<Reservation> reservationCaptor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(reservationCaptor.capture());

        Reservation savedReservation = reservationCaptor.getValue();
        assertEquals(ReservationStatus.CONFIRMED, savedReservation.getStatus());
    }

    @Test
    void whenHandleCheckoutSessionCompleted_withEmptyDeserializer_thenReturnEarly() {
        // Arrange
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handleCheckoutSessionCompleted(event);

        // Assert
        verify(paymentIntentRepository, never()).findByStripeSessionId(anyString());
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandleCheckoutSessionCompleted_withNonSessionObject_thenReturnEarly() {
        // Arrange
        StripeObject nonSessionObject = mock(com.stripe.model.PaymentIntent.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(nonSessionObject));

        // Act
        stripeWebhookService.handleCheckoutSessionCompleted(event);

        // Assert
        verify(paymentIntentRepository, never()).findByStripeSessionId(anyString());
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandleCheckoutSessionCompleted_withNoPaymentRecord_thenReturnEarly() {
        // Arrange
        Session session = mock(Session.class);
        when(session.getId()).thenReturn(SESSION_ID);
        when(session.getPaymentIntent()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(session));
        when(paymentIntentRepository.findByStripeSessionId(SESSION_ID)).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handleCheckoutSessionCompleted(event);

        // Assert
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandleCheckoutSessionCompleted_withNoReservation_thenUpdatePaymentOnly() {
        // Arrange
        Session session = mock(Session.class);
        when(session.getId()).thenReturn(SESSION_ID);
        when(session.getPaymentIntent()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(session));

        PaymentIntent payment = createPaymentIntent();
        payment.setStripeSessionId(SESSION_ID);
        payment.setStatus(PaymentStatus.PENDING);

        when(paymentIntentRepository.findByStripeSessionId(SESSION_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handleCheckoutSessionCompleted(event);

        // Assert
        verify(paymentIntentRepository, times(1)).save(any(PaymentIntent.class));
        verify(reservationRepository, never()).save(any());
    }

    // ==================== handlePaymentIntentSucceeded Tests ====================

    @Test
    void whenHandlePaymentIntentSucceeded_withValidPaymentIntent_thenUpdatePaymentAndReservation() {
        // Arrange
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        PaymentIntent payment = createPaymentIntent();
        payment.setStatus(PaymentStatus.PROCESSING);

        Reservation reservation = createReservation();
        reservation.setStatus(ReservationStatus.PENDING);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        ArgumentCaptor<PaymentIntent> paymentCaptor = ArgumentCaptor.forClass(PaymentIntent.class);
        verify(paymentIntentRepository).save(paymentCaptor.capture());

        PaymentIntent savedPayment = paymentCaptor.getValue();
        assertEquals(PaymentStatus.SUCCEEDED, savedPayment.getStatus());
        assertNotNull(savedPayment.getUpdatedAt());

        ArgumentCaptor<Reservation> reservationCaptor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(reservationCaptor.capture());

        Reservation savedReservation = reservationCaptor.getValue();
        assertEquals(ReservationStatus.CONFIRMED, savedReservation.getStatus());
    }

    @Test
    void whenHandlePaymentIntentSucceeded_withEmptyDeserializer_thenReturnEarly() {
        // Arrange
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        verify(paymentIntentRepository, never()).findByStripePaymentIntentId(anyString());
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandlePaymentIntentSucceeded_withNonPaymentIntentObject_thenReturnEarly() {
        // Arrange
        StripeObject nonPaymentIntentObject = mock(Session.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(nonPaymentIntentObject));

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        verify(paymentIntentRepository, never()).findByStripePaymentIntentId(anyString());
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandlePaymentIntentSucceeded_withNoPaymentRecord_thenReturnEarly() {
        // Arrange
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandlePaymentIntentSucceeded_withNoReservation_thenUpdatePaymentOnly() {
        // Arrange
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        PaymentIntent payment = createPaymentIntent();
        payment.setStatus(PaymentStatus.PROCESSING);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        verify(paymentIntentRepository, times(1)).save(any(PaymentIntent.class));
        verify(reservationRepository, never()).save(any());
    }

    // ==================== handlePaymentIntentFailed Tests ====================

    @Test
    void whenHandlePaymentIntentFailed_withValidPaymentIntent_thenMarkPaymentAndReservationFailed() {
        // Arrange
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        PaymentIntent payment = createPaymentIntent();
        payment.setStatus(PaymentStatus.PROCESSING);

        Reservation reservation = createReservation();
        reservation.setStatus(ReservationStatus.PENDING);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));

        // Act
        stripeWebhookService.handlePaymentIntentFailed(event);

        // Assert
        ArgumentCaptor<PaymentIntent> paymentCaptor = ArgumentCaptor.forClass(PaymentIntent.class);
        verify(paymentIntentRepository).save(paymentCaptor.capture());

        PaymentIntent savedPayment = paymentCaptor.getValue();
        assertEquals(PaymentStatus.FAILED, savedPayment.getStatus());
        assertNotNull(savedPayment.getUpdatedAt());

        ArgumentCaptor<Reservation> reservationCaptor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(reservationCaptor.capture());

        Reservation savedReservation = reservationCaptor.getValue();
        assertEquals(ReservationStatus.CANCELLED, savedReservation.getStatus());
    }

    @Test
    void whenHandlePaymentIntentFailed_withEmptyDeserializer_thenReturnEarly() {
        // Arrange
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handlePaymentIntentFailed(event);

        // Assert
        verify(paymentIntentRepository, never()).findByStripePaymentIntentId(anyString());
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandlePaymentIntentFailed_withNonPaymentIntentObject_thenReturnEarly() {
        // Arrange
        StripeObject nonPaymentIntentObject = mock(Session.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(nonPaymentIntentObject));

        // Act
        stripeWebhookService.handlePaymentIntentFailed(event);

        // Assert
        verify(paymentIntentRepository, never()).findByStripePaymentIntentId(anyString());
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandlePaymentIntentFailed_withNoPaymentRecord_thenReturnEarly() {
        // Arrange
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handlePaymentIntentFailed(event);

        // Assert
        verify(paymentIntentRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenHandlePaymentIntentFailed_withNoReservation_thenUpdatePaymentOnly() {
        // Arrange
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        PaymentIntent payment = createPaymentIntent();
        payment.setStatus(PaymentStatus.PROCESSING);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handlePaymentIntentFailed(event);

        // Assert
        verify(paymentIntentRepository, times(1)).save(any(PaymentIntent.class));
        verify(reservationRepository, never()).save(any());
    }

    // ==================== updateReservationStatus Tests ====================

    @Test
    void whenUpdateReservationStatus_withStatusChange_thenSaveReservation() {
        // Arrange
        Reservation reservation = createReservation();
        reservation.setStatus(ReservationStatus.PENDING);

        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));

        // Act - call via handlePaymentIntentSucceeded to test updateReservationStatus
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        PaymentIntent payment = createPaymentIntent();
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));

        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        ArgumentCaptor<Reservation> reservationCaptor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(reservationCaptor.capture());

        Reservation savedReservation = reservationCaptor.getValue();
        assertEquals(ReservationStatus.CONFIRMED, savedReservation.getStatus());
    }

    @Test
    void whenUpdateReservationStatus_withSameStatus_thenDoNotSave() {
        // Arrange
        Reservation reservation = createReservation();
        reservation.setStatus(ReservationStatus.CONFIRMED);  // Already confirmed

        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));

        // Act - call via handlePaymentIntentSucceeded to test updateReservationStatus
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        PaymentIntent payment = createPaymentIntent();
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));

        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert - payment saved but reservation not updated (no status change)
        verify(paymentIntentRepository, times(1)).save(any(PaymentIntent.class));
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenUpdateReservationStatus_withNullReservationId_thenReturnEarly() {
        // Arrange
        when(reservationRepository.findByReservationId(null)).thenReturn(Optional.empty());

        // Act - call via handlePaymentIntentSucceeded with null reservationId
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        PaymentIntent payment = createPaymentIntent();
        payment.setReservationId(null);  // Null reservation ID
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));

        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert - payment saved but no reservation update attempted
        verify(paymentIntentRepository, times(1)).save(any(PaymentIntent.class));
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void whenUpdateReservationStatus_withDifferentStatusTransitions_thenUpdateCorrectly() {
        // Test PENDING -> CANCELLED transition
        Reservation reservation = createReservation();
        reservation.setStatus(ReservationStatus.PENDING);

        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));

        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        PaymentIntent payment = createPaymentIntent();
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));

        stripeWebhookService.handlePaymentIntentFailed(event);

        // Assert
        ArgumentCaptor<Reservation> reservationCaptor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(reservationCaptor.capture());

        Reservation savedReservation = reservationCaptor.getValue();
        assertEquals(ReservationStatus.CANCELLED, savedReservation.getStatus());
    }

    // ==================== Helper Methods ====================

    private PaymentIntent createPaymentIntent() {
        PaymentIntent payment = new PaymentIntent();
        payment.setStripePaymentIntentId(PAYMENT_INTENT_ID);
        payment.setReservationId(RESERVATION_ID);
        payment.setStatus(PaymentStatus.PENDING);
        return payment;
    }

    private Reservation createReservation() {
        Reservation reservation = new Reservation();
        reservation.setReservationId(RESERVATION_ID);
        reservation.setStatus(ReservationStatus.PENDING);
        return reservation;
    }
}
