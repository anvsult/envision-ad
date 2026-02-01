package com.envisionad.webservice.payment.presentationlayer;

import com.envisionad.webservice.advertisement.businesslogiclayer.AdCampaignService;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignIdentifier;
import com.envisionad.webservice.business.dataaccesslayer.Employee;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.business.dataaccesslayer.EmployeeRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.payment.businesslogiclayer.StripeWebhookService;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus;
import com.envisionad.webservice.payment.dataaccesslayer.*;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.utils.EmailService;
import com.stripe.model.Account;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;


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
    private MediaRepository mediaRepository;

    @Mock
    private AdCampaignRepository adCampaignRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private StripeAccountRepository stripeAccountRepository;

    @Mock
    private AdCampaignService adCampaignService;

    @Mock
    private Event event;

    @Mock
    private EventDataObjectDeserializer deserializer;

    private static final String SESSION_ID = "sess_123456";
    private static final String PAYMENT_INTENT_ID = "pi_3QfRBWHI4UD28XdL0H0YVZTa";
    private static final String RESERVATION_ID = "res_550e8400-e29b-41d4-a716-446655440000";
    private static final String BUSINESS_ID = "550e8400-e29b-41d4-a716-446655440000";

    @BeforeEach
    void setUp() {
        reset(paymentIntentRepository, reservationRepository, mediaRepository, adCampaignRepository, employeeRepository, emailService, stripeAccountRepository, adCampaignService, event, deserializer);
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

        Media media = new Media();
        media.setBusinessId(UUID.fromString(BUSINESS_ID)); // Match payment business ID
        reservation.setMediaId(media.getId());


        when(paymentIntentRepository.findByStripeSessionId(SESSION_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(mediaRepository.findById(reservation.getMediaId())).thenReturn(Optional.of(media));
        when(adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId())).thenReturn(new AdCampaign());
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

        Media mockMedia = new Media();
        mockMedia.setBusinessId(UUID.fromString(BUSINESS_ID)); // Match payment business ID
        reservation.setMediaId(mockMedia.getId());

        AdCampaign mockCampaign = new AdCampaign();

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(mediaRepository.findById(reservation.getMediaId())).thenReturn(Optional.of(mockMedia));
        when(adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId())).thenReturn(mockCampaign);

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

        Media mockMedia = new Media();
        mockMedia.setBusinessId(UUID.fromString(BUSINESS_ID)); // Match payment business ID
        reservation.setMediaId(mockMedia.getId());

        AdCampaign mockCampaign = new AdCampaign();

        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(mediaRepository.findById(reservation.getMediaId())).thenReturn(Optional.of(mockMedia));
        when(adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId())).thenReturn(mockCampaign);

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
    void whenStatusIsConfirmed_thenStatusShouldBeConfirmed() {
        // Arrange
        PaymentIntent payment = createPaymentIntent();
        Reservation reservation = createReservation();
        reservation.setStatus(ReservationStatus.PENDING);

        Media mockMedia = new Media();
        mockMedia.setBusinessId(UUID.fromString(BUSINESS_ID)); // Match payment business ID
        mockMedia.setTitle("Test Media");
        reservation.setMediaId(mockMedia.getId());

        AdCampaign mockCampaign = new AdCampaign();
        mockCampaign.setName("Test Campaign");

        Employee mockEmployee = mock(Employee.class);
        when(mockEmployee.getEmail()).thenReturn("owner@example.com");

        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(mediaRepository.findById(reservation.getMediaId())).thenReturn(Optional.of(mockMedia));
        when(adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId())).thenReturn(mockCampaign);
        when(employeeRepository.findAllByBusinessId_BusinessId(any())).thenReturn(List.of(mockEmployee));

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        assertEquals(ReservationStatus.CONFIRMED, reservation.getStatus());
        verify(paymentIntentRepository).save(payment);
        verify(reservationRepository).save(reservation);
    }


    @Test
    void whenUpdateReservationStatus_withSameStatus_thenDoNotSave() {
        // Arrange
        Reservation reservation = createReservation();
        reservation.setStatus(ReservationStatus.CONFIRMED);  // Already confirmed

        Media mockMedia = new Media();
        mockMedia.setBusinessId(UUID.fromString(BUSINESS_ID)); // Match payment business ID
        reservation.setMediaId(mockMedia.getId());

        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(mediaRepository.findById(reservation.getMediaId())).thenReturn(Optional.of(mockMedia));

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
        payment.setAmount(new BigDecimal("100.00")); // Set matching amount
        payment.setBusinessId(BUSINESS_ID); // Set business ID
        return payment;
    }

    private Reservation createReservation() {
        Reservation reservation = new Reservation();
        reservation.setReservationId(RESERVATION_ID);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setTotalPrice(new BigDecimal("100.00")); // Set matching amount
        reservation.setMediaId(UUID.randomUUID()); // Set media ID
        reservation.setCampaignId("campaign-123"); // Set campaign ID
        return reservation;
    }

    // ==================== handleAccountUpdated Tests ====================
    @Test
    void whenHandleAccountUpdated_withValidAccountEvent_thenUpdateStripeAccount() {
        // Arrange
        String stripeAccountId = "acct_123Test";
        Account stripeAccount = mock(Account.class);
        when(stripeAccount.getId()).thenReturn(stripeAccountId);
        when(stripeAccount.getDetailsSubmitted()).thenReturn(true);
        when(stripeAccount.getChargesEnabled()).thenReturn(true);
        when(stripeAccount.getPayoutsEnabled()).thenReturn(true);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripeAccount));

        StripeAccount localStripeAccount = new StripeAccount();
        localStripeAccount.setStripeAccountId(stripeAccountId);
        localStripeAccount.setOnboardingComplete(false); // Initial state
        localStripeAccount.setChargesEnabled(false);
        localStripeAccount.setPayoutsEnabled(false);

        when(stripeAccountRepository.findByStripeAccountId(stripeAccountId)).thenReturn(Optional.of(localStripeAccount));

        // Act
        stripeWebhookService.handleAccountUpdated(event);

        // Assert
        ArgumentCaptor<StripeAccount> accountCaptor = ArgumentCaptor.forClass(StripeAccount.class);
        verify(stripeAccountRepository).save(accountCaptor.capture());

        StripeAccount savedAccount = accountCaptor.getValue();
        assertTrue(savedAccount.isOnboardingComplete());
        assertTrue(savedAccount.isChargesEnabled());
        assertTrue(savedAccount.isPayoutsEnabled());
    }

    @Test
    void whenHandleAccountUpdated_withNoLocalAccount_thenLogWarningAndDoNotSave() {
        // Arrange
        String stripeAccountId = "acct_unknown";
        Account stripeAccount = mock(Account.class);
        when(stripeAccount.getId()).thenReturn(stripeAccountId);

        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(stripeAccount));
        when(stripeAccountRepository.findByStripeAccountId(stripeAccountId)).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handleAccountUpdated(event);

        // Assert
        verify(stripeAccountRepository, never()).save(any(StripeAccount.class));
    }

    @Test
    void whenHandleAccountUpdated_withEmptyDeserializer_thenReturnEarly() {
        // Arrange
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.empty());

        // Act
        stripeWebhookService.handleAccountUpdated(event);

        // Assert
        verify(stripeAccountRepository, never()).findByStripeAccountId(anyString());
        verify(stripeAccountRepository, never()).save(any(StripeAccount.class));
    }

    @Test
    void whenHandleAccountUpdated_withNonAccountObject_thenReturnEarly() {
        // Arrange
        StripeObject nonAccountObject = mock(Session.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(nonAccountObject));

        // Act
        stripeWebhookService.handleAccountUpdated(event);

        // Assert
        verify(stripeAccountRepository, never()).findByStripeAccountId(anyString());
        verify(stripeAccountRepository, never()).save(any(StripeAccount.class));
    }

    // ==================== sendNotificationEmails (covers sendReservationEmail) Tests ====================

    @Test
    void whenSendNotificationEmails_withConfirmedReservation_thenEmailIsSent() {
        // Arrange
        UUID mediaId = UUID.randomUUID();
        UUID businessId = UUID.fromString(BUSINESS_ID); // Use consistent business ID
        String campaignId = "campaign123";
        String mediaOwnerEmail = "owner@example.com";
        BigDecimal totalPrice = new BigDecimal("100.00");

        Media media = mock(Media.class);
        when(media.getTitle()).thenReturn("Test Media Title");
        when(media.getBusinessId()).thenReturn(businessId);

        Reservation reservation = createReservation();
        reservation.setMediaId(mediaId);
        reservation.setCampaignId(campaignId);
        reservation.setTotalPrice(totalPrice);

        AdCampaign campaign = mock(AdCampaign.class);
        when(campaign.getCampaignId()).thenReturn(new AdCampaignIdentifier(campaignId));
        when(campaign.getName()).thenReturn("Test Campaign Name");

        Employee employee = mock(Employee.class);
        when(employee.getEmail()).thenReturn(mediaOwnerEmail);

        List<String> imageLinks = List.of("http://example.com/ad1.jpg", "http://example.com/ad2.png");
        when(adCampaignService.getAllCampaignImageLinks(campaignId)).thenReturn(imageLinks);
        when(employeeRepository.findAllByBusinessId_BusinessId(businessId.toString()))
                .thenReturn(List.of(employee));

        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(mediaRepository.findById(reservation.getMediaId())).thenReturn(Optional.of(media));
        when(adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId())).thenReturn(campaign);

        PaymentIntent payment = createPaymentIntent();
        payment.setBusinessId(businessId.toString()); // Match media business ID
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));

        // Mock the Event and Stripe PaymentIntent
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        Event event = mock(Event.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        ArgumentCaptor<String> recipientCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> subjectCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);

        verify(emailService, times(1)).sendSimpleEmail(
                recipientCaptor.capture(),
                subjectCaptor.capture(),
                bodyCaptor.capture()
        );

        assertEquals(mediaOwnerEmail, recipientCaptor.getValue());
        assertEquals("New Reservation Created", subjectCaptor.getValue());

        String expectedBodyStart = String.format("A new reservation has been created for your media%n" +
                "Media Name: %s%n" +
                "Ad Campaign Name: %s%n" +
                "Total Price: $%.2f%n", media.getTitle(), campaign.getName(), totalPrice);
        String expectedPreviewSection = String.format("Preview Images:%n- %s%n- %s",
                imageLinks.get(0), imageLinks.get(1));

        assertTrue(bodyCaptor.getValue().startsWith(expectedBodyStart));
        assertTrue(bodyCaptor.getValue().contains(expectedPreviewSection));
    }

    @Test
    void whenSendNotificationEmails_withNoMediaOwnerEmail_thenNoEmailIsSent() {
        // Arrange
        UUID mediaId = UUID.randomUUID();
        UUID businessId = UUID.fromString(BUSINESS_ID); // Use consistent business ID
        String campaignId = "campaign123";
        BigDecimal totalPrice = new BigDecimal("100.00");

        Media media = mock(Media.class);
        when(media.getBusinessId()).thenReturn(businessId); // keep only the needed stubbing

        Reservation reservation = new Reservation();
        reservation.setReservationId(RESERVATION_ID);
        reservation.setMediaId(mediaId);
        reservation.setCampaignId(campaignId);
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING);

        AdCampaign campaign = mock(AdCampaign.class);
        // removed unnecessary stubbing: when(campaign.getCampaignId()).thenReturn(...);

        when(employeeRepository.findAllByBusinessId_BusinessId(anyString())).thenReturn(List.of()); // No employees/emails

        // Setup for updateReservationStatus
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(mediaRepository.findById(reservation.getMediaId())).thenReturn(Optional.of(media));
        when(adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId())).thenReturn(campaign);

        PaymentIntent payment = createPaymentIntent();
        payment.setBusinessId(businessId.toString()); // Match media business ID
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));

        // Mock the Event and Stripe PaymentIntent
        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        Event event = mock(Event.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        verify(emailService, never()).sendSimpleEmail(anyString(), anyString(), anyString());
    }


    @Test
    void whenSendNotificationEmails_withNoImageLinks_thenEmailSentWithoutPreviewSection() {
        // Arrange
        UUID mediaId = UUID.randomUUID();
        UUID businessId = UUID.fromString(BUSINESS_ID); // Use consistent business ID
        String campaignId = "campaign123";
        String mediaOwnerEmail = "owner@example.com";
        BigDecimal totalPrice = new BigDecimal("100.00");

        Media media = mock(Media.class);
        when(media.getTitle()).thenReturn("Test Media Title");
        when(media.getBusinessId()).thenReturn(businessId);

        Reservation reservation = createReservation();
        reservation.setMediaId(mediaId);
        reservation.setCampaignId(campaignId);
        reservation.setTotalPrice(totalPrice);

        AdCampaign campaign = mock(AdCampaign.class);
        when(campaign.getCampaignId()).thenReturn(new AdCampaignIdentifier(campaignId));
        when(campaign.getName()).thenReturn("Test Campaign Name");

        Employee employee = mock(Employee.class);
        when(employee.getEmail()).thenReturn(mediaOwnerEmail);

        when(adCampaignService.getAllCampaignImageLinks(campaignId)).thenReturn(List.of()); // No image links
        when(employeeRepository.findAllByBusinessId_BusinessId(businessId.toString()))
                .thenReturn(List.of(employee));

        // Setup for updateReservationStatus
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(mediaRepository.findById(reservation.getMediaId())).thenReturn(Optional.of(media));
        when(adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId())).thenReturn(campaign);

        PaymentIntent payment = createPaymentIntent();
        payment.setBusinessId(businessId.toString()); // Match media business ID
        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.of(payment));

        com.stripe.model.PaymentIntent stripePaymentIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripePaymentIntent.getId()).thenReturn(PAYMENT_INTENT_ID);

        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(deserializer.getObject()).thenReturn(Optional.of(stripePaymentIntent));

        Event event = mock(Event.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

        // Act
        stripeWebhookService.handlePaymentIntentSucceeded(event);

        // Assert
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService, times(1)).sendSimpleEmail(anyString(), anyString(), bodyCaptor.capture());

        String expectedBodyStart = String.format("A new reservation has been created for your media%n" +
                "Media Name: %s%n" +
                "Ad Campaign Name: %s%n" +
                "Total Price: $%.2f%n", media.getTitle(), campaign.getName(), totalPrice);
        String expectedPreviewSection = "No preview images available.";

        assertTrue(bodyCaptor.getValue().startsWith(expectedBodyStart));
        assertTrue(bodyCaptor.getValue().contains(expectedPreviewSection));
    }
}

