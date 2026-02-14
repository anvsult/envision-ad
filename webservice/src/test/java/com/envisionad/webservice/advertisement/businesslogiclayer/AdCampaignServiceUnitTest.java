package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.envisionad.webservice.advertisement.dataaccesslayer.*;
import com.envisionad.webservice.advertisement.datamapperlayer.AdResponseMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignResponseMapper;
import com.envisionad.webservice.advertisement.exceptions.*;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.utils.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.oauth2.jwt.Jwt;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class AdCampaignServiceUnitTest {

    @Mock private AdCampaignRepository adCampaignRepository;
    @Mock private AdResponseMapper adResponseMapper;
    @Mock private AdCampaignResponseMapper adCampaignResponseMapper;
    @Mock private ReservationRepository reservationRepository;

    @Mock private Cloudinary cloudinary;
    @Mock private Uploader uploader;
    @Mock private JwtUtils jwtUtils;

    @InjectMocks private AdCampaignServiceImpl service;

    private Jwt advertiserToken;
    @BeforeEach
    void setUp() {
        lenient().when(cloudinary.uploader()).thenReturn(uploader);
        advertiserToken = createJwtToken(
                List.of("read:campaign", "create:campaign", "update:campaign", "update:business",
                        "read:employee", "create:employee", "delete:employee", "read:verification", "create:verification",
                        "delete:campaign"));

    }

    private Jwt createJwtToken(List<String> permissions) {
        return Jwt.withTokenValue("advertiser-token")
                .header("alg", "none")
                .claim("sub", "auth0|696a88eb347945897ef17093")
                .claim("scope", "read write")
                .claim("permissions", permissions)
                .build();
    }

    @Test
    void getActiveCampaignCount_shouldReturnCount() {

        // Arrange
        String businessId = "business-123";
        Integer expectedCount = 5;

        when(reservationRepository.countActiveCampaignsByAdvertiserId(
                eq(businessId),
                any()
        )).thenReturn(expectedCount);

        // Act
        Integer result = service.getActiveCampaignCount(businessId);

        // Assert
        assertEquals(expectedCount, result);

        verify(reservationRepository, times(1))
                .countActiveCampaignsByAdvertiserId(eq(businessId), any());
    }


    @Test
    void deleteAdFromCampaign_whenUrlIsNull_doesNotCallCloudinary_andDeletesAd() throws IOException {

        // Arrange
        String campaignId = "camp-1";
        CampaignAndAdId data = campaignWithSingleAd(campaignId, null);

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(data.campaign);
        when(adCampaignRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));
        when(adResponseMapper.entityToResponseModel(any()))
                .thenReturn(null);

        // Act
        service.deleteAdFromCampaign(campaignId, data.adId);

        // Assert
        verify(uploader, never()).destroy(anyString(), anyMap());
        verify(adCampaignRepository).save(data.campaign);
        assertEquals(0, data.campaign.getAds().size());
    }

    @Test
    void deleteAdFromCampaign_whenUrlIsBlank_doesNotCallCloudinary_andDeletesAd() throws IOException {

        // Arrange
        String campaignId = "camp-1";
        CampaignAndAdId data = campaignWithSingleAd(campaignId, "   ");

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(data.campaign);
        when(adCampaignRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));
        when(adResponseMapper.entityToResponseModel(any()))
                .thenReturn(null);

        // Act
        service.deleteAdFromCampaign(campaignId, data.adId);

        // Assert
        verify(uploader, never()).destroy(anyString(), anyMap());
        verify(adCampaignRepository).save(data.campaign);
        assertEquals(0, data.campaign.getAds().size());
    }

    @Test
    void deleteAdFromCampaign_whenValidImageUrl_callsCloudinaryDestroy() throws Exception {

        // Arrange
        String campaignId = "camp-1";
        String url = "https://res.cloudinary.com/demo/image/upload/v12345/envisionad/ads/banner_01.jpg";
        CampaignAndAdId data = campaignWithSingleAd(campaignId, url);

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(data.campaign);
        when(adCampaignRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));
        when(adResponseMapper.entityToResponseModel(any()))
                .thenReturn(null);

        when(uploader.destroy(anyString(), anyMap()))
                .thenReturn(Map.of("result", "ok"));

        // Act
        service.deleteAdFromCampaign(campaignId, data.adId);

        // Assert
        verify(uploader).destroy(anyString(), argThat(opts ->
                Boolean.TRUE.equals(opts.get("invalidate")) &&
                        opts.get("resource_type") != null
        ));
        verify(adCampaignRepository).save(data.campaign);
        assertEquals(0, data.campaign.getAds().size());
    }

    @Test
    void deleteAdFromCampaign_whenUrlHasLeadingTrailingWhitespace_stillCallsCloudinaryDestroy() throws Exception {

        // Arrange
        String campaignId = "camp-1";
        String urlWithSpaces =
                " https://res.cloudinary.com/demo/image/upload/v12345/envisionad/ads/banner_01.jpg ";

        CampaignAndAdId data = campaignWithSingleAd(campaignId, urlWithSpaces);

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(data.campaign);
        when(adCampaignRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));
        when(adResponseMapper.entityToResponseModel(any()))
                .thenReturn(null);

        when(uploader.destroy(anyString(), anyMap()))
                .thenReturn(Map.of("result", "ok"));

        // Act
        service.deleteAdFromCampaign(campaignId, data.adId);

        // Assert
        ArgumentCaptor<String> publicIdCaptor = ArgumentCaptor.forClass(String.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> optionsCaptor = ArgumentCaptor.forClass(Map.class);

        verify(uploader).destroy(publicIdCaptor.capture(), optionsCaptor.capture());

        assertNotNull(publicIdCaptor.getValue());
        assertFalse(publicIdCaptor.getValue().isBlank());

        Map<String, Object> opts = optionsCaptor.getValue();
        assertEquals(true, opts.get("invalidate"));
        assertNotNull(opts.get("resource_type"));

        verify(adCampaignRepository).save(data.campaign);
        assertEquals(0, data.campaign.getAds().size());
    }

    @Test
    void deleteAdFromCampaign_whenUrlHasTransformations_stillDeletesAsset() throws Exception {

        // Arrange
        String campaignId = "camp-1";
        String url = "https://res.cloudinary.com/demo/image/upload/c_fill,w_800,h_400,q_auto,f_auto/v9999/envisionad/ads/banner_02.png";
        CampaignAndAdId data = campaignWithSingleAd(campaignId, url);

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(data.campaign);
        when(adCampaignRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));
        when(adResponseMapper.entityToResponseModel(any()))
                .thenReturn(null);

        when(uploader.destroy(anyString(), anyMap()))
                .thenReturn(Map.of("result", "ok"));

        // Act
        service.deleteAdFromCampaign(campaignId, data.adId);

        // Assert
        verify(uploader).destroy(anyString(), argThat(opts ->
                Boolean.TRUE.equals(opts.get("invalidate")) &&
                        opts.get("resource_type") != null
        ));
    }

    @Test
    void deleteAdFromCampaign_whenVideoUrl_setsResourceTypeVideo() throws Exception {

        // Arrange
        String campaignId = "camp-1";
        String url = "https://res.cloudinary.com/demo/video/upload/v12345/envisionad/ads/spot_01.mp4";
        CampaignAndAdId data = campaignWithSingleAd(campaignId, url);

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(data.campaign);
        when(adCampaignRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));
        when(adResponseMapper.entityToResponseModel(any()))
                .thenReturn(null);

        when(uploader.destroy(anyString(), anyMap()))
                .thenReturn(Map.of("result", "ok"));

        // Act
        service.deleteAdFromCampaign(campaignId, data.adId);

        // Assert
        verify(uploader).destroy(anyString(), argThat(opts ->
                Boolean.TRUE.equals(opts.get("invalidate")) &&
                        "video".equals(opts.get("resource_type"))
        ));
    }

    @Test
    void deleteAdFromCampaign_whenCloudinaryFails_stillDeletesAd() throws Exception {

        // Arrange
        String campaignId = "camp-1";
        String url = "https://res.cloudinary.com/demo/image/upload/v12345/envisionad/ads/banner_03.jpg";
        CampaignAndAdId data = campaignWithSingleAd(campaignId, url);

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(data.campaign);
        when(adCampaignRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));
        when(adResponseMapper.entityToResponseModel(any()))
                .thenReturn(null);

        when(uploader.destroy(anyString(), anyMap()))
                .thenThrow(new RuntimeException("Cloudinary down"));

        // Act
        service.deleteAdFromCampaign(campaignId, data.adId);

        // Assert
        verify(uploader, times(1)).destroy(anyString(), anyMap());
        verify(adCampaignRepository).save(data.campaign);
        assertEquals(0, data.campaign.getAds().size());

    }

    @Test
    void deleteAdFromCampaign_whenCampaignNotFound_throwsException() throws IOException {

        // Arrange
        String campaignId = "missing";
        String adId = UUID.randomUUID().toString();

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(null);

        // Act & Assert
        assertThrows(AdCampaignNotFoundException.class,
                () -> service.deleteAdFromCampaign(campaignId, adId));

        verify(uploader, never()).destroy(anyString(), anyMap());
        verify(adCampaignRepository, never()).save(any());
    }

    @Test
    void deleteAdFromCampaign_whenAdNotFound_throwsException() throws IOException {

        // Arrange
        String campaignId = "camp-1";
        String missingAdId = UUID.randomUUID().toString();

        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
        campaign.setAds(new ArrayList<>());

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId))
                .thenReturn(campaign);

        // Act & Assert
        assertThrows(AdNotFoundException.class,
                () -> service.deleteAdFromCampaign(campaignId, missingAdId));

        verify(uploader, never()).destroy(anyString(), anyMap());
        verify(adCampaignRepository, never()).save(any());
    }

    // ---------------- Helpers ----------------

    private static class CampaignAndAdId {
        final AdCampaign campaign;
        final String adId;
        CampaignAndAdId(AdCampaign campaign, String adId) {
            this.campaign = campaign;
            this.adId = adId;
        }
    }

    private CampaignAndAdId campaignWithSingleAd(String campaignId, String url) {
        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(campaignId));

        Ad ad = new Ad();
        String id = UUID.randomUUID().toString();
        ad.setAdIdentifier(new AdIdentifier(id));
        ad.setAdUrl(url);
        ad.setCampaign(campaign);

        campaign.setAds(new ArrayList<>(List.of(ad)));

        return new CampaignAndAdId(campaign, id);
    }

    @Test
    void deleteAdCampaign_whenNotTiedToAnyReservations_deletesSuccessfully() {
        // Arrange
        String businessId = "biz-1";
        String campaignId = "camp-1";
        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
        campaign.setAds(new ArrayList<>());

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
        doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(any(Jwt.class), eq(businessId));
        doNothing().when(jwtUtils).validateBusinessOwnsCampaign(eq(businessId), eq(campaign));

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.CONFIRMED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.PENDING),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.APPROVED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(adCampaignResponseMapper.entityToResponseModel(campaign)).thenReturn(null);

        // Act
        service.deleteAdCampaign(advertiserToken, businessId, campaignId);

        // Assert
        verify(adCampaignRepository).delete(campaign);
        verify(adCampaignResponseMapper).entityToResponseModel(campaign);
    }

    @Test
    void deleteAdCampaign_whenNotTiedToReservationsAndHasCloudinaryAds_deletesAssetsAndCampaign() throws IOException {
        // Arrange
        String businessId = "biz-1";
        String campaignId = "camp-cloudinary-1";
        String cloudinaryUrl = "https://res.cloudinary.com/demo/image/upload/v1234567/sample-public-id.jpg";

        CampaignAndAdId campaignAndAdId = campaignWithSingleAd(campaignId, cloudinaryUrl);
        AdCampaign campaignWithAd = campaignAndAdId.campaign;

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaignWithAd);
        doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(any(Jwt.class), eq(businessId));
        doNothing().when(jwtUtils).validateBusinessOwnsCampaign(eq(businessId), eq(campaignWithAd));

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.CONFIRMED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.PENDING),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.APPROVED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(uploader.destroy(anyString(), anyMap())).thenReturn(Map.of("result", "ok"));

        when(adCampaignResponseMapper.entityToResponseModel(campaignWithAd)).thenReturn(null);

        // Act
        service.deleteAdCampaign(advertiserToken, businessId, campaignId);

        // Assert
        verify(adCampaignRepository).delete(campaignWithAd);
        verify(adCampaignResponseMapper).entityToResponseModel(campaignWithAd);
        // Verify that the Cloudinary asset tied to the ad was scheduled for deletion
        verify(uploader, atLeastOnce()).destroy(anyString(), anyMap());
    }

    @Test
    void deleteAdCampaign_whenTiedToConfirmedReservation_throwsException() {
        // Arrange
        String businessId = "biz-1";
        String campaignId = "camp-2";
        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
        campaign.setAds(new ArrayList<>());

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
        doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(any(Jwt.class), eq(businessId));
        doNothing().when(jwtUtils).validateBusinessOwnsCampaign(eq(businessId), eq(campaign));

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.CONFIRMED),
                any(LocalDateTime.class)
        )).thenReturn(true);

        // Act & Assert
        assertThrows(CampaignHasConfirmedReservationException.class,
            () -> service.deleteAdCampaign(advertiserToken, businessId, campaignId));
        verify(adCampaignRepository, never()).delete(any());
    }

    @Test
    void deleteAdCampaign_whenTiedToPendingReservation_throwsException() {
        // Arrange
        String businessId = "biz-1";
        String campaignId = "camp-3";
        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
        campaign.setAds(new ArrayList<>());

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
        doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(any(Jwt.class), eq(businessId));
        doNothing().when(jwtUtils).validateBusinessOwnsCampaign(eq(businessId), eq(campaign));

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.CONFIRMED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.PENDING),
                any(LocalDateTime.class)
        )).thenReturn(true);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.APPROVED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        // Act & Assert
        assertThrows(CampaignHasPendingReservationException.class,
            () -> service.deleteAdCampaign(advertiserToken, businessId, campaignId));
        verify(adCampaignRepository, never()).delete(any());
    }

    @Test
    void deleteAdCampaign_whenTiedToApprovedReservation_throwsException() {
        // Arrange
        String businessId = "biz-1";
        String campaignId = "camp-5";
        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
        campaign.setAds(new ArrayList<>());

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
        doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(any(Jwt.class), eq(businessId));
        doNothing().when(jwtUtils).validateBusinessOwnsCampaign(eq(businessId), eq(campaign));

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.CONFIRMED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.APPROVED),
                any(LocalDateTime.class)
        )).thenReturn(true);

        // Act & Assert
        assertThrows(CampaignHasApprovedReservationException.class,
            () -> service.deleteAdCampaign(advertiserToken, businessId, campaignId));
        verify(adCampaignRepository, never()).delete(any());
    }

    @Test
    void deleteAdCampaign_whenTiedToDeniedReservation_deletesSuccessfully() {
        // Arrange
        String businessId = "biz-1";
        String campaignId = "camp-4";
        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
        campaign.setAds(new ArrayList<>());

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
        doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(any(Jwt.class), eq(businessId));
        doNothing().when(jwtUtils).validateBusinessOwnsCampaign(eq(businessId), eq(campaign));

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.CONFIRMED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.PENDING),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(reservationRepository.existsByCampaignIdAndStatus(
                eq(campaignId),
                eq(ReservationStatus.APPROVED),
                any(LocalDateTime.class)
        )).thenReturn(false);

        when(adCampaignResponseMapper.entityToResponseModel(campaign)).thenReturn(null);

        // Act
        service.deleteAdCampaign(advertiserToken, businessId, campaignId);

        // Assert
        verify(adCampaignRepository).delete(campaign);
        verify(adCampaignResponseMapper).entityToResponseModel(campaign);
    }
}
