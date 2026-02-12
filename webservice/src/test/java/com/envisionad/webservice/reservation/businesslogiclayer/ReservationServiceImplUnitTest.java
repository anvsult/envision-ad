package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignIdentifier;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.reservation.dataaccesslayer.*;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationResponseMapper;
import com.envisionad.webservice.reservation.exceptions.ReservationAlreadyProcessedException;
import com.envisionad.webservice.reservation.exceptions.ReservationNotFoundException;
import com.envisionad.webservice.reservation.presentationlayer.models.DenialDetailsRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import com.envisionad.webservice.utils.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceImplUnitTest {

    @InjectMocks
    private ReservationServiceImpl reservationService;

    @Mock private ReservationRepository reservationRepository;
    @Mock private AdCampaignRepository adCampaignRepository;
    @Mock private ReservationResponseMapper reservationResponseMapper;
    @Mock private MediaRepository mediaRepository;
    @Mock private JwtUtils jwtUtils;

    private Jwt mediaToken;

    private static final String BUSINESS_ID = "b1000000-0000-0000-0000-000000000001";

    @BeforeEach
    void setUp() {
        mediaToken = Jwt.withTokenValue("media-token")
                .header("alg", "none")
                .subject("auth0|696a89137cfdb558ea4a4a4a")
                .claim("scope", "read write")
                .claim("permissions", List.of("create:media", "update:media", "update:business",
                        "read:employee", "create:employee", "delete:employee",
                        "read:verification", "create:verification"))
                .build();
    }

    private void stubMediaLookup(String mediaId) {
        Media media = mock(Media.class);
        when(media.getBusinessId()).thenReturn(UUID.fromString(BUSINESS_ID));
        when(mediaRepository.findById(UUID.fromString(mediaId)))
                .thenReturn(Optional.of(media));
    }

    @Test
    void getAllReservationsByMediaId_populatesCampaignNames_whenCampaignsExist() {
        String mediaId = UUID.randomUUID().toString();
        stubMediaLookup(mediaId);

        Reservation r1 = mock(Reservation.class);
        when(r1.getCampaignId()).thenReturn("camp-1");
        Reservation r2 = mock(Reservation.class);
        when(r2.getCampaignId()).thenReturn("camp-2");
        List<Reservation> reservations = List.of(r1, r2);

        ReservationResponseModel rm1 = new ReservationResponseModel();
        rm1.setCampaignId("camp-1");
        ReservationResponseModel rm2 = new ReservationResponseModel();
        rm2.setCampaignId("camp-2");
        List<ReservationResponseModel> mapped = List.of(rm1, rm2);

        when(reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId)))
                .thenReturn(reservations);
        when(reservationResponseMapper.entitiesToResponseModelList(reservations))
                .thenReturn(mapped);

        AdCampaign c1 = mock(AdCampaign.class);
        AdCampaignIdentifier id1 = mock(AdCampaignIdentifier.class);
        when(id1.getCampaignId()).thenReturn("camp-1");
        when(c1.getCampaignId()).thenReturn(id1);
        when(c1.getName()).thenReturn("Winter Promo");

        AdCampaign c2 = mock(AdCampaign.class);
        AdCampaignIdentifier id2 = mock(AdCampaignIdentifier.class);
        when(id2.getCampaignId()).thenReturn("camp-2");
        when(c2.getCampaignId()).thenReturn(id2);
        when(c2.getName()).thenReturn("Spring Launch");

        when(adCampaignRepository.findAllByCampaignId_CampaignIdIn(List.of("camp-1", "camp-2")))
                .thenReturn(List.of(c1, c2));

        List<ReservationResponseModel> result = reservationService.getAllReservationsByMediaId(mediaToken, mediaId);

        assertEquals(2, result.size());
        assertEquals("Winter Promo", result.get(0).getCampaignName());
        assertEquals("Spring Launch", result.get(1).getCampaignName());
        verify(jwtUtils).validateUserIsEmployeeOfBusiness(mediaToken, BUSINESS_ID);
    }

    @Test
    void getAllReservationsByMediaId_skipsNullOrBlankCampaignIds_andDoesNotCrash() {
        String mediaId = UUID.randomUUID().toString();
        stubMediaLookup(mediaId);

        Reservation r1 = mock(Reservation.class); when(r1.getCampaignId()).thenReturn(null);
        Reservation r2 = mock(Reservation.class); when(r2.getCampaignId()).thenReturn("");
        Reservation r3 = mock(Reservation.class); when(r3.getCampaignId()).thenReturn("   ");
        Reservation r4 = mock(Reservation.class); when(r4.getCampaignId()).thenReturn("camp-1");
        List<Reservation> reservations = List.of(r1, r2, r3, r4);

        ReservationResponseModel rm1 = new ReservationResponseModel(); rm1.setCampaignId(null);
        ReservationResponseModel rm2 = new ReservationResponseModel(); rm2.setCampaignId("");
        ReservationResponseModel rm3 = new ReservationResponseModel(); rm3.setCampaignId("   ");
        ReservationResponseModel rm4 = new ReservationResponseModel(); rm4.setCampaignId("camp-1");
        List<ReservationResponseModel> mapped = List.of(rm1, rm2, rm3, rm4);

        when(reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId)))
                .thenReturn(reservations);
        when(reservationResponseMapper.entitiesToResponseModelList(reservations))
                .thenReturn(mapped);

        AdCampaign c1 = mock(AdCampaign.class);
        AdCampaignIdentifier id1 = mock(AdCampaignIdentifier.class);
        when(id1.getCampaignId()).thenReturn("camp-1");
        when(c1.getCampaignId()).thenReturn(id1);
        when(c1.getName()).thenReturn("Only Valid Campaign");

        when(adCampaignRepository.findAllByCampaignId_CampaignIdIn(anyList()))
                .thenReturn(List.of(c1));

        List<ReservationResponseModel> result = reservationService.getAllReservationsByMediaId(mediaToken, mediaId);

        assertEquals(4, result.size());
        assertNull(result.get(0).getCampaignName());
        assertNull(result.get(1).getCampaignName());
        assertNull(result.get(2).getCampaignName());
        assertEquals("Only Valid Campaign", result.get(3).getCampaignName());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<String>> captor = ArgumentCaptor.forClass(List.class);
        verify(adCampaignRepository).findAllByCampaignId_CampaignIdIn(captor.capture());
        assertEquals(List.of("camp-1"), captor.getValue());
        verify(jwtUtils).validateUserIsEmployeeOfBusiness(mediaToken, BUSINESS_ID);
    }

    @Test
    void getAllReservationsByMediaId_campaignMissing_keepsCampaignNameNull_forThatReservation() {
        String mediaId = UUID.randomUUID().toString();
        stubMediaLookup(mediaId);

        Reservation r1 = mock(Reservation.class); when(r1.getCampaignId()).thenReturn("camp-1");
        Reservation r2 = mock(Reservation.class); when(r2.getCampaignId()).thenReturn("camp-missing");
        List<Reservation> reservations = List.of(r1, r2);

        ReservationResponseModel rm1 = new ReservationResponseModel(); rm1.setCampaignId("camp-1");
        ReservationResponseModel rm2 = new ReservationResponseModel(); rm2.setCampaignId("camp-missing");
        List<ReservationResponseModel> mapped = List.of(rm1, rm2);

        when(reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId)))
                .thenReturn(reservations);
        when(reservationResponseMapper.entitiesToResponseModelList(reservations))
                .thenReturn(mapped);

        AdCampaign c1 = mock(AdCampaign.class);
        AdCampaignIdentifier id1 = mock(AdCampaignIdentifier.class);
        when(id1.getCampaignId()).thenReturn("camp-1");
        when(c1.getCampaignId()).thenReturn(id1);
        when(c1.getName()).thenReturn("Found Campaign");

        when(adCampaignRepository.findAllByCampaignId_CampaignIdIn(anyList()))
                .thenReturn(List.of(c1));

        List<ReservationResponseModel> result = reservationService.getAllReservationsByMediaId(mediaToken, mediaId);

        assertEquals("Found Campaign", result.get(0).getCampaignName());
        assertNull(result.get(1).getCampaignName());
        verify(jwtUtils).validateUserIsEmployeeOfBusiness(mediaToken, BUSINESS_ID);
    }

    @Test
    void getAllReservationsByMediaId_whenNoValidCampaignIds_doesNotCallBatchFetch() {
        String mediaId = UUID.randomUUID().toString();
        stubMediaLookup(mediaId);

        Reservation r1 = mock(Reservation.class); when(r1.getCampaignId()).thenReturn(null);
        Reservation r2 = mock(Reservation.class); when(r2.getCampaignId()).thenReturn("   ");
        List<Reservation> reservations = List.of(r1, r2);

        ReservationResponseModel rm1 = new ReservationResponseModel(); rm1.setCampaignId(null);
        ReservationResponseModel rm2 = new ReservationResponseModel(); rm2.setCampaignId("   ");
        List<ReservationResponseModel> mapped = List.of(rm1, rm2);

        when(reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId)))
                .thenReturn(reservations);
        when(reservationResponseMapper.entitiesToResponseModelList(reservations))
                .thenReturn(mapped);

        List<ReservationResponseModel> result = reservationService.getAllReservationsByMediaId(mediaToken, mediaId);

        assertEquals(2, result.size());
        verify(adCampaignRepository, never()).findAllByCampaignId_CampaignIdIn(anyList());
        verify(jwtUtils).validateUserIsEmployeeOfBusiness(mediaToken, BUSINESS_ID);
    }

    @Test
    void approveReservation_whenValidPending_shouldApprove() {
        // Arrange
        String mediaId = UUID.randomUUID().toString();
        String resId = "res-123";
        stubMediaLookup(mediaId);

        Reservation reservation = new Reservation();
        reservation.setReservationId(resId);
        reservation.setStatus(ReservationStatus.PENDING);

        when(reservationRepository.findByReservationId(resId)).thenReturn(Optional.of(reservation));
        when(reservationResponseMapper.entityToResponseModel(any())).thenReturn(new ReservationResponseModel());

        // Act
        ReservationResponseModel result = reservationService.approveReservation(mediaToken, mediaId, resId);

        // Assert
        assertNotNull(result);
        assertEquals(ReservationStatus.APPROVED, reservation.getStatus());
        verify(reservationRepository).save(reservation);
    }

    @Test
    void approveReservation_whenMediaNotFound_shouldThrowException() {
        String mediaId = UUID.randomUUID().toString();
        when(mediaRepository.findById(UUID.fromString(mediaId))).thenReturn(Optional.empty());

        assertThrows(MediaNotFoundException.class, () ->
                reservationService.approveReservation(mediaToken, mediaId, "any"));
    }

    @Test
    void approveReservation_whenAlreadyProcessed_shouldThrowException() {
        String mediaId = UUID.randomUUID().toString();
        stubMediaLookup(mediaId);

        Reservation reservation = new Reservation();
        reservation.setStatus(ReservationStatus.CONFIRMED);
        when(reservationRepository.findByReservationId("res-123")).thenReturn(Optional.of(reservation));

        assertThrows(ReservationAlreadyProcessedException.class, () ->
                reservationService.approveReservation(mediaToken, mediaId, "res-123"));
    }

    @Test
    void getAllReservationByMediaOwnerBusinessId_shouldFilterAndPopulateNames() {
        // Arrange
        String myBusinessId = UUID.randomUUID().toString();
        UUID mediaId = UUID.randomUUID();

        // Reservation 1: Belongs to my business
        Reservation r1 = new Reservation();
        r1.setMediaId(mediaId);
        r1.setCampaignId("camp-1");

        // Reservation 2: Belongs to someone else
        Reservation r2 = new Reservation();
        r2.setMediaId(UUID.randomUUID());

        when(reservationRepository.findAll()).thenReturn(List.of(r1, r2));

        // Mock Media lookup for the filter
        Media myMedia = new Media();
        myMedia.setBusinessId(UUID.fromString(myBusinessId));
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.of(myMedia));

        // Mock mapping and Campaign lookup
        ReservationResponseModel model = new ReservationResponseModel();
        model.setCampaignId("camp-1");
        when(reservationResponseMapper.entityToResponseModel(r1)).thenReturn(model);

        AdCampaign campaign = mock(AdCampaign.class);
        AdCampaignIdentifier capId = new AdCampaignIdentifier("camp-1");
        when(campaign.getCampaignId()).thenReturn(capId);
        when(campaign.getName()).thenReturn("Verified Campaign");
        when(adCampaignRepository.findAllByCampaignId_CampaignIdIn(anyList())).thenReturn(List.of(campaign));

        // Act
        List<ReservationResponseModel> result = reservationService.getAllReservationByMediaOwnerBusinessId(mediaToken, myBusinessId);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Verified Campaign", result.get(0).getCampaignName());
        verify(jwtUtils).validateUserIsEmployeeOfBusiness(mediaToken, myBusinessId);
    }

    @Test
    void getAllReservationByMediaOwnerBusinessId_whenUnauthorized_shouldThrowException() {
        String businessId = UUID.randomUUID().toString();
        doThrow(new org.springframework.security.access.AccessDeniedException("Unauthorized"))
                .when(jwtUtils).validateUserIsEmployeeOfBusiness(mediaToken, businessId);

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () ->
                reservationService.getAllReservationByMediaOwnerBusinessId(mediaToken, businessId));
    }

    @Test
    void approveReservationStatus_whenReservationNotFound_shouldThrowException() {
        String mediaId = UUID.randomUUID().toString();
        String resId = "non-existent-res";
        stubMediaLookup(mediaId);

        when(reservationRepository.findByReservationId(resId)).thenReturn(Optional.empty());

        assertThrows(ReservationNotFoundException.class, () -> reservationService.approveReservation(mediaToken, mediaId, resId));
    }

    @Test
    void getAllReservationByMediaOwnerBusinessId_whenMediaRecordMissing_shouldSkipReservation() {
        String myBusinessId = UUID.randomUUID().toString();
        Reservation r1 = new Reservation();
        r1.setMediaId(UUID.randomUUID());

        when(reservationRepository.findAll()).thenReturn(List.of(r1));
        // Simulate media record being missing from DB
        when(mediaRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        List<ReservationResponseModel> result = reservationService.getAllReservationByMediaOwnerBusinessId(mediaToken, myBusinessId);

        assertTrue(result.isEmpty());
        verify(reservationResponseMapper, never()).entityToResponseModel(any());
    }

    @Test
    void approveReservation_whenValidPending_shouldReject() {
        String mediaId = UUID.randomUUID().toString();
        String resId = "res-456";
        stubMediaLookup(mediaId);

        Reservation reservation = new Reservation();
        reservation.setStatus(ReservationStatus.PENDING);
        DenialDetailsRequestModel details = new DenialDetailsRequestModel();
        details.setReason(DenialReason.OTHER);
        details.setDescription("test");

        when(reservationRepository.findByReservationId(resId)).thenReturn(Optional.of(reservation));
        when(reservationResponseMapper.entityToResponseModel(any())).thenReturn(new ReservationResponseModel());

        reservationService.denyReservation(mediaToken, mediaId, resId, details);

        assertEquals(ReservationStatus.DENIED, reservation.getStatus());
        verify(reservationRepository).save(reservation);
    }

}