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