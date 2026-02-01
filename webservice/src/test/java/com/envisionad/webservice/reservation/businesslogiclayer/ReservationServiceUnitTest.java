package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignIdentifier;
import com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationRequestMapper;
import com.envisionad.webservice.reservation.exceptions.PaymentVerificationException;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.stripe.exception.StripeException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceUnitTest {

    @InjectMocks
    private ReservationServiceImpl reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private ReservationRequestMapper reservationRequestMapper;

    @Mock
    private PaymentIntentRepository paymentIntentRepository;

    private static final String PAYMENT_INTENT_ID = "pi_3QfRBWHI4UD28XdL0H0YVZTa";
    private static final String RESERVATION_ID = "550e8400-e29b-41d4-a716-446655440000";
    private static final String BUSINESS_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22"; // Media owner's business
    private static final String ADVERTISER_BUSINESS_ID = "c1ffdcaa-ad1c-5fg9-cc7e-7cc0ce491c33"; // Advertiser's business (different from media owner)
    private static final String USER_ID = "auth0|696a88eb347945897ef17093";
    private static final String MEDIA_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    private static final String CAMPAIGN_ID = "camp_123456";
    private static final BigDecimal TOTAL_PRICE = new BigDecimal("150.00");

    private ReservationRequestModel requestModel;
    private Media media;
    private Reservation reservation;

    @BeforeEach
    void setUp() {
        // Setup request model
        requestModel = new ReservationRequestModel();
        requestModel.setCampaignId(CAMPAIGN_ID);
        requestModel.setStartDate(LocalDateTime.now().plusDays(1));
        requestModel.setEndDate(LocalDateTime.now().plusDays(8));

        // Setup media
        media = new Media();
        media.setId(UUID.fromString(MEDIA_ID));
        media.setTitle("Downtown Digital Billboard");
        media.setBusinessId(UUID.fromString(BUSINESS_ID));

        // Setup campaign
        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(CAMPAIGN_ID));
        campaign.setBusinessId(new BusinessIdentifier(ADVERTISER_BUSINESS_ID)); // Advertiser's business, not media owner's
        campaign.setName("Summer Sale Campaign");

        // Setup reservation
        reservation = new Reservation();
        reservation.setReservationId(RESERVATION_ID);
        reservation.setMediaId(UUID.fromString(MEDIA_ID));
        reservation.setCampaignId(CAMPAIGN_ID);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setTotalPrice(TOTAL_PRICE);
        reservation.setAdvertiserId(USER_ID);
    }

    // ==================== handlePaidReservation Tests ====================

    @Test
    void whenHandlePaidReservation_withSuccessfulPayment_thenCreateConfirmedReservation() throws Exception {
        // Arrange
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");
        when(stripeIntent.getAmount()).thenReturn(15000L); // $150.00 in cents
        when(stripeIntent.getCurrency()).thenReturn("cad");

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", RESERVATION_ID);
        metadata.put("businessId", ADVERTISER_BUSINESS_ID); // Use advertiser's business ID
        when(stripeIntent.getMetadata()).thenReturn(metadata);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.empty());
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.empty());
        when(reservationRequestMapper.requestModelToEntity(requestModel)).thenReturn(reservation);
        when(paymentIntentRepository.save(any(PaymentIntent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);
            Reservation result = (Reservation) method.invoke(reservationService,
                    PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);

            // Assert
            assertNotNull(result);
            assertEquals(ReservationStatus.CONFIRMED, result.getStatus());
            assertEquals(RESERVATION_ID, result.getReservationId());
            assertEquals(USER_ID, result.getAdvertiserId());
            assertEquals(TOTAL_PRICE, result.getTotalPrice());

            // Verify payment record created
            ArgumentCaptor<PaymentIntent> paymentCaptor = ArgumentCaptor.forClass(PaymentIntent.class);
            verify(paymentIntentRepository).save(paymentCaptor.capture());

            PaymentIntent savedPayment = paymentCaptor.getValue();
            assertEquals(PAYMENT_INTENT_ID, savedPayment.getStripePaymentIntentId());
            assertEquals(RESERVATION_ID, savedPayment.getReservationId());
            assertEquals(ADVERTISER_BUSINESS_ID, savedPayment.getBusinessId());
            assertEquals(TOTAL_PRICE, savedPayment.getAmount());
            assertEquals(PaymentStatus.SUCCEEDED, savedPayment.getStatus());
        }
    }

    @Test
    void whenHandlePaidReservation_withPaymentNotSucceeded_thenThrowException() throws Exception {
        // Arrange
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("processing");

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act & Assert
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);

            Exception exception = assertThrows(Exception.class, () -> {
                try {
                    method.invoke(reservationService, PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);
                } catch (java.lang.reflect.InvocationTargetException e) {
                    throw e.getCause();
                }
            });

            assertInstanceOf(PaymentVerificationException.class, exception);
            assertTrue(exception.getMessage().contains("has status 'processing'"));
        }
    }

    @Test
    void whenHandlePaidReservation_withMissingMetadata_thenThrowException() throws Exception {
        // Arrange
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");
        when(stripeIntent.getMetadata()).thenReturn(null);

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act & Assert
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);

            Exception exception = assertThrows(Exception.class, () -> {
                try {
                    method.invoke(reservationService, PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);
                } catch (java.lang.reflect.InvocationTargetException e) {
                    throw e.getCause();
                }
            });

            assertInstanceOf(PaymentVerificationException.class, exception);
            assertTrue(exception.getMessage().contains("missing required metadata"));
        }
    }

    @Test
    void whenHandlePaidReservation_withAmountMismatch_thenThrowException() throws Exception {
        // Arrange
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");
        when(stripeIntent.getAmount()).thenReturn(10000L); // Wrong amount
        when(stripeIntent.getCurrency()).thenReturn("cad");

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", RESERVATION_ID);
        metadata.put("businessId", ADVERTISER_BUSINESS_ID); // Use advertiser's business ID
        when(stripeIntent.getMetadata()).thenReturn(metadata);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.empty());

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act & Assert
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);

            Exception exception = assertThrows(Exception.class, () -> {
                try {
                    method.invoke(reservationService, PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);
                } catch (java.lang.reflect.InvocationTargetException e) {
                    throw e.getCause();
                }
            });

            assertInstanceOf(PaymentVerificationException.class, exception);
            assertTrue(exception.getMessage().contains("amount mismatch"));
        }
    }

    @Test
    void whenHandlePaidReservation_withWrongCurrency_thenThrowException() throws Exception {
        // Arrange
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");
        when(stripeIntent.getAmount()).thenReturn(15000L);
        when(stripeIntent.getCurrency()).thenReturn("usd"); // Wrong currency

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", RESERVATION_ID);
        metadata.put("businessId", ADVERTISER_BUSINESS_ID); // Use advertiser's business ID
        when(stripeIntent.getMetadata()).thenReturn(metadata);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID)).thenReturn(Optional.empty());

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act & Assert
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);

            Exception exception = assertThrows(Exception.class, () -> {
                try {
                    method.invoke(reservationService, PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);
                } catch (java.lang.reflect.InvocationTargetException e) {
                    throw e.getCause();
                }
            });

            assertInstanceOf(PaymentVerificationException.class, exception);
            assertTrue(exception.getMessage().contains("currency mismatch"));
        }
    }

    @Test
    void whenHandlePaidReservation_withExistingPaymentAndReservation_thenReturnExistingReservation() throws Exception {
        // Arrange
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", RESERVATION_ID);
        metadata.put("businessId", ADVERTISER_BUSINESS_ID); // Use advertiser's business ID, not media owner's
        when(stripeIntent.getMetadata()).thenReturn(metadata);

        PaymentIntent existingPayment = new PaymentIntent();
        existingPayment.setStripePaymentIntentId(PAYMENT_INTENT_ID);
        existingPayment.setReservationId(RESERVATION_ID);
        existingPayment.setBusinessId(ADVERTISER_BUSINESS_ID); // Use advertiser's business ID

        Reservation existingReservation = new Reservation();
        existingReservation.setReservationId(RESERVATION_ID);
        existingReservation.setStatus(ReservationStatus.CONFIRMED);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.of(existingPayment));
        when(reservationRepository.findByReservationId(RESERVATION_ID))
                .thenReturn(Optional.of(existingReservation));

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);
            Reservation result = (Reservation) method.invoke(reservationService,
                    PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);

            // Assert
            assertNotNull(result);
            assertEquals(RESERVATION_ID, result.getReservationId());
            assertEquals(ReservationStatus.CONFIRMED, result.getStatus());

            // Verify no new payment was created
            verify(paymentIntentRepository, never()).save(any());
        }
    }

    @Test
    void whenHandlePaidReservation_withExistingPaymentButReservationNotFound_thenContinueProcessing() throws Exception {
        // Arrange - Edge case: payment has reservationId matching metadata, but reservation doesn't exist in DB
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");
        when(stripeIntent.getAmount()).thenReturn(15000L);
        when(stripeIntent.getCurrency()).thenReturn("cad");

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", RESERVATION_ID);
        metadata.put("businessId", ADVERTISER_BUSINESS_ID); // Use advertiser's business ID
        when(stripeIntent.getMetadata()).thenReturn(metadata);

        PaymentIntent existingPayment = new PaymentIntent();
        existingPayment.setStripePaymentIntentId(PAYMENT_INTENT_ID);
        existingPayment.setReservationId(RESERVATION_ID);
        existingPayment.setBusinessId(ADVERTISER_BUSINESS_ID); // Use advertiser's business ID

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.of(existingPayment));
        when(reservationRepository.findByReservationId(RESERVATION_ID))
                .thenReturn(Optional.empty()); // Reservation not found!
        when(reservationRequestMapper.requestModelToEntity(requestModel)).thenReturn(reservation);

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);
            Reservation result = (Reservation) method.invoke(reservationService,
                    PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);

            // Assert - Should continue and create new confirmed reservation
            assertNotNull(result);
            assertEquals(RESERVATION_ID, result.getReservationId());
            assertEquals(ReservationStatus.CONFIRMED, result.getStatus());

            // Verify no payment update happened since payment already had reservationId
            verify(paymentIntentRepository, never()).save(any());
        }
    }

    @Test
    void whenHandlePaidReservation_withPaymentReuseAttempt_thenThrowException() throws Exception {
        // Arrange
        String differentReservationId = "different-reservation-id";

        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", differentReservationId);
        metadata.put("businessId", ADVERTISER_BUSINESS_ID); // Use advertiser's business ID
        when(stripeIntent.getMetadata()).thenReturn(metadata);

        PaymentIntent existingPayment = new PaymentIntent();
        existingPayment.setStripePaymentIntentId(PAYMENT_INTENT_ID);
        existingPayment.setReservationId(RESERVATION_ID); // Already associated with another reservation
        existingPayment.setBusinessId(ADVERTISER_BUSINESS_ID); // Use advertiser's business ID

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.of(existingPayment));

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act & Assert
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);

            Exception exception = assertThrows(Exception.class, () -> {
                try {
                    method.invoke(reservationService, PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);
                } catch (java.lang.reflect.InvocationTargetException e) {
                    throw e.getCause();
                }
            });

            assertInstanceOf(PaymentVerificationException.class, exception);
            assertTrue(exception.getMessage().contains("already associated with reservation"));
            assertTrue(exception.getMessage().contains("cannot reuse"));
        }
    }

    @Test
    void whenHandlePaidReservation_withExistingPaymentNoReservationId_thenUpdatePayment() throws Exception {
        // Arrange - This tests the bug fix where payment exists but has no reservationId yet
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");
        when(stripeIntent.getAmount()).thenReturn(15000L);
        when(stripeIntent.getCurrency()).thenReturn("cad");

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", RESERVATION_ID);
        metadata.put("businessId", ADVERTISER_BUSINESS_ID); // Use advertiser's business ID
        when(stripeIntent.getMetadata()).thenReturn(metadata);

        PaymentIntent existingPayment = new PaymentIntent();
        existingPayment.setStripePaymentIntentId(PAYMENT_INTENT_ID);
        existingPayment.setReservationId(null); // No reservation ID yet
        existingPayment.setBusinessId(ADVERTISER_BUSINESS_ID); // Use advertiser's business ID

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.of(existingPayment));
        when(reservationRepository.findByReservationId(RESERVATION_ID)).thenReturn(Optional.empty());
        when(reservationRequestMapper.requestModelToEntity(requestModel)).thenReturn(reservation);
        when(paymentIntentRepository.save(any(PaymentIntent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);
            Reservation result = (Reservation) method.invoke(reservationService,
                    PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);

            // Assert
            assertNotNull(result);
            assertEquals(ReservationStatus.CONFIRMED, result.getStatus());

            // Verify payment was updated
            ArgumentCaptor<PaymentIntent> paymentCaptor = ArgumentCaptor.forClass(PaymentIntent.class);
            verify(paymentIntentRepository).save(paymentCaptor.capture());

            PaymentIntent updatedPayment = paymentCaptor.getValue();
            assertEquals(PAYMENT_INTENT_ID, updatedPayment.getStripePaymentIntentId());
            assertEquals(RESERVATION_ID, updatedPayment.getReservationId());
            assertEquals(PaymentStatus.SUCCEEDED, updatedPayment.getStatus());
        }
    }

    @Test
    void whenHandlePaidReservation_withExistingReservationPending_thenUpdateToConfirmed() throws Exception {
        // Arrange
        com.stripe.model.PaymentIntent stripeIntent = mock(com.stripe.model.PaymentIntent.class);
        when(stripeIntent.getStatus()).thenReturn("succeeded");
        when(stripeIntent.getAmount()).thenReturn(15000L);
        when(stripeIntent.getCurrency()).thenReturn("cad");

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reservationId", RESERVATION_ID);
        metadata.put("businessId", ADVERTISER_BUSINESS_ID); // Use advertiser's business ID
        when(stripeIntent.getMetadata()).thenReturn(metadata);

        Reservation existingReservation = new Reservation();
        existingReservation.setReservationId(RESERVATION_ID);
        existingReservation.setStatus(ReservationStatus.PENDING);

        when(paymentIntentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID))
                .thenReturn(Optional.empty());
        when(reservationRepository.findByReservationId(RESERVATION_ID))
                .thenReturn(Optional.of(existingReservation));

        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenReturn(stripeIntent);

            // Act
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);
            Reservation result = (Reservation) method.invoke(reservationService,
                    PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);

            // Assert
            assertNotNull(result);
            assertEquals(ReservationStatus.CONFIRMED, result.getStatus());
            assertEquals(TOTAL_PRICE, result.getTotalPrice());
            assertEquals(USER_ID, result.getAdvertiserId());
        }
    }

    @Test
    void whenHandlePaidReservation_withStripeException_thenThrowPaymentVerificationException() throws Exception {
        // Arrange
        try (MockedStatic<com.stripe.model.PaymentIntent> mockedStatic = mockStatic(com.stripe.model.PaymentIntent.class)) {
            mockedStatic.when(() -> com.stripe.model.PaymentIntent.retrieve(PAYMENT_INTENT_ID))
                    .thenThrow(new StripeException("Network error", "request_id", "code", 500) {});

            // Act & Assert
            Method method = ReservationServiceImpl.class.getDeclaredMethod(
                    "handlePaidReservation", String.class, ReservationRequestModel.class,
                    Media.class, String.class, BigDecimal.class);
            method.setAccessible(true);

            Exception exception = assertThrows(Exception.class, () -> {
                try {
                    method.invoke(reservationService, PAYMENT_INTENT_ID, requestModel, media, USER_ID, TOTAL_PRICE);
                } catch (java.lang.reflect.InvocationTargetException e) {
                    throw e.getCause();
                }
            });

            assertInstanceOf(PaymentVerificationException.class, exception);
            assertTrue(exception.getMessage().contains("Failed to verify payment with Stripe"));
        }
    }

    // ==================== createPendingReservation Tests ====================

    @Test
    void whenCreatePendingReservation_thenReturnPendingReservation() throws Exception {
        // Arrange
        when(reservationRequestMapper.requestModelToEntity(requestModel)).thenReturn(reservation);

        // Act
        Method method = ReservationServiceImpl.class.getDeclaredMethod(
                "createPendingReservation", ReservationRequestModel.class, Media.class,
                String.class, BigDecimal.class);
        method.setAccessible(true);
        Reservation result = (Reservation) method.invoke(reservationService,
                requestModel, media, USER_ID, TOTAL_PRICE);

        // Assert
        assertNotNull(result);
        assertEquals(ReservationStatus.PENDING, result.getStatus());
        assertNotNull(result.getReservationId());
        assertEquals(USER_ID, result.getAdvertiserId());
        assertEquals(TOTAL_PRICE, result.getTotalPrice());
        assertEquals(UUID.fromString(MEDIA_ID), result.getMediaId());
    }

    // ==================== loadAndValidateMedia Tests ====================

    @Test
    void whenLoadAndValidateMedia_withNullPrice_thenThrowIllegalStateException() throws Exception {
        // Arrange
        media.setPrice(null);
        when(mediaRepository.findById(UUID.fromString(MEDIA_ID))).thenReturn(Optional.of(media));

        // Act & Assert
        Method method = ReservationServiceImpl.class.getDeclaredMethod(
                "loadAndValidateMedia", String.class);
        method.setAccessible(true);

        Exception exception = assertThrows(Exception.class, () -> {
            try {
                method.invoke(reservationService, MEDIA_ID);
            } catch (java.lang.reflect.InvocationTargetException e) {
                throw e.getCause();
            }
        });

        assertInstanceOf(IllegalStateException.class, exception);
        assertTrue(exception.getMessage().contains("does not have a valid price"));
    }

    @Test
    void whenLoadAndValidateMedia_withZeroPrice_thenThrowIllegalStateException() throws Exception {
        // Arrange
        media.setPrice(BigDecimal.ZERO);
        when(mediaRepository.findById(UUID.fromString(MEDIA_ID))).thenReturn(Optional.of(media));

        // Act & Assert
        Method method = ReservationServiceImpl.class.getDeclaredMethod(
                "loadAndValidateMedia", String.class);
        method.setAccessible(true);

        Exception exception = assertThrows(Exception.class, () -> {
            try {
                method.invoke(reservationService, MEDIA_ID);
            } catch (java.lang.reflect.InvocationTargetException e) {
                throw e.getCause();
            }
        });

        assertInstanceOf(IllegalStateException.class, exception);
        assertTrue(exception.getMessage().contains("does not have a valid price"));
    }

    @Test
    void whenLoadAndValidateMedia_withNegativePrice_thenThrowIllegalStateException() throws Exception {
        // Arrange
        media.setPrice(new BigDecimal("-10.00"));
        when(mediaRepository.findById(UUID.fromString(MEDIA_ID))).thenReturn(Optional.of(media));

        // Act & Assert
        Method method = ReservationServiceImpl.class.getDeclaredMethod(
                "loadAndValidateMedia", String.class);
        method.setAccessible(true);

        Exception exception = assertThrows(Exception.class, () -> {
            try {
                method.invoke(reservationService, MEDIA_ID);
            } catch (java.lang.reflect.InvocationTargetException e) {
                throw e.getCause();
            }
        });

        assertInstanceOf(IllegalStateException.class, exception);
        assertTrue(exception.getMessage().contains("does not have a valid price"));
    }

    @Test
    void whenLoadAndValidateMedia_withValidPrice_thenReturnMedia() throws Exception {
        // Arrange
        media.setPrice(new BigDecimal("100.00"));
        when(mediaRepository.findById(UUID.fromString(MEDIA_ID))).thenReturn(Optional.of(media));

        // Act
        Method method = ReservationServiceImpl.class.getDeclaredMethod(
                "loadAndValidateMedia", String.class);
        method.setAccessible(true);
        Media result = (Media) method.invoke(reservationService, MEDIA_ID);

        // Assert
        assertNotNull(result);
        assertEquals(media.getId(), result.getId());
        assertTrue(result.getPrice().compareTo(BigDecimal.ZERO) > 0);
    }

}