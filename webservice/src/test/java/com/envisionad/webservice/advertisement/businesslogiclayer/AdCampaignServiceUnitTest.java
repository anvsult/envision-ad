package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.envisionad.webservice.advertisement.dataaccesslayer.*;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignResponseMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdResponseMapper;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.advertisement.exceptions.AdNotFoundException;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.utils.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class AdCampaignServiceUnitTest {

    @Mock private BusinessRepository businessRepository;
    @Mock private AdCampaignRepository adCampaignRepository;
    @Mock private AdCampaignRequestMapper adCampaignRequestMapper;
    @Mock private AdCampaignResponseMapper adCampaignResponseMapper;
    @Mock private AdRequestMapper adRequestMapper;
    @Mock private AdResponseMapper adResponseMapper;
    @Mock private JwtUtils jwtUtils;
    @Mock private ReservationRepository reservationRepository;

    @Mock private Cloudinary cloudinary;
    @Mock private Uploader uploader;

    @InjectMocks private AdCampaignServiceImpl service;

    @BeforeEach
    void setupCloudinary() {
        lenient().when(cloudinary.uploader()).thenReturn(uploader);
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
                Boolean.TRUE.equals(opts.get("invalidate"))
        ));
        verify(adCampaignRepository).save(data.campaign);
        assertEquals(0, data.campaign.getAds().size());
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
}
