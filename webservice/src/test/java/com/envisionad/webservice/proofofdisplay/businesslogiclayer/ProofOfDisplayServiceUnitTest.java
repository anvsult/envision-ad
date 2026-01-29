package com.envisionad.webservice.proofofdisplay.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier;
import com.envisionad.webservice.business.dataaccesslayer.Employee;
import com.envisionad.webservice.business.dataaccesslayer.EmployeeRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.proofofdisplay.exceptions.AdvertiserEmailNotFoundException;
import com.envisionad.webservice.proofofdisplay.presentationlayer.models.ProofOfDisplayRequest;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.utils.EmailService;
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
class ProofOfDisplayServiceUnitTest {

    @InjectMocks
    private ProofOfDisplayService proofOfDisplayService;

    @Mock
    private EmailService emailService;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private AdCampaignRepository adCampaignRepository;

    @Mock
    private JwtUtils jwtUtils;

    private UUID mediaUuid;


    @BeforeEach
    void setUp() {
        mediaUuid = UUID.randomUUID();
    }

    private Jwt mockJwtSubjectOnly() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");
        return jwt;
    }

    private Jwt mockJwtPassingAuth() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("auth0|123");

        // only needed for tests that reach authorization
        when(jwtUtils.extractUserId(jwt)).thenReturn("auth0|123");
        doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(anyString(), anyString());

        return jwt;
    }

    @Mock
    private ReservationRepository reservationRepository;

    @Test
    void sendProofEmail_success_sendsEmailWithUrls() {
        // Arrange
        ProofOfDisplayRequest request = new ProofOfDisplayRequest();
        request.setMediaId(mediaUuid.toString());
        request.setCampaignId("camp-123");
        request.setProofImageUrls(List.of("https://img1.example", "https://img2.example"));

        Jwt jwt = mockJwtPassingAuth();

        Media media = mock(Media.class);
        when(media.getTitle()).thenReturn("Champlain E Block");
        when(media.getBusinessId()).thenReturn(UUID.randomUUID());
        when(mediaRepository.findById(mediaUuid)).thenReturn(Optional.of(media));

        // Mock campaign + embedded business id
        AdCampaign campaign = mock(AdCampaign.class);
        when(campaign.getName()).thenReturn("Winter Promo");

        BusinessIdentifier businessIdentifier = mock(BusinessIdentifier.class);
        when(businessIdentifier.getBusinessId()).thenReturn("biz-999");
        when(campaign.getBusinessId()).thenReturn(businessIdentifier);

        when(adCampaignRepository.findByCampaignId_CampaignId("camp-123")).thenReturn(campaign);

        Employee emp1 = mock(Employee.class);
        when(emp1.getEmail()).thenReturn("advertiser@company.com");
        when(employeeRepository.findAllByBusinessId_BusinessId("biz-999")).thenReturn(List.of(emp1));

        ArgumentCaptor<String> toCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> subjectCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);

        when(reservationRepository.existsConfirmedReservationForMediaAndCampaign(mediaUuid, "camp-123"))
                .thenReturn(true);

        // Act
        proofOfDisplayService.sendProofEmail(jwt, request);

        // Assert
        verify(emailService).sendSimpleEmail(toCaptor.capture(), subjectCaptor.capture(), bodyCaptor.capture());

        assertEquals("advertiser@company.com", toCaptor.getValue());
        assertEquals("Your ad is live!", subjectCaptor.getValue());

        String body = bodyCaptor.getValue();
        assertTrue(body.contains("Campaign: Winter Promo"));
        assertTrue(body.contains("Media location: Champlain E Block"));
        assertTrue(body.contains("Proof images:"));
        assertTrue(body.contains("- https://img1.example"));
        assertTrue(body.contains("- https://img2.example"));
    }


    @Test
    void sendProofEmail_whenProofUrlsNull_throws_andDoesNotSendEmail() {
        // Arrange
        ProofOfDisplayRequest request = new ProofOfDisplayRequest();
        request.setMediaId(mediaUuid.toString());
        request.setCampaignId("camp-123");
        request.setProofImageUrls(null);

        Jwt jwt = mockJwtSubjectOnly();

        // Act + Assert
        assertThrows(IllegalArgumentException.class, () -> proofOfDisplayService.sendProofEmail(jwt, request));
        verifyNoInteractions(emailService);
    }

    @Test
    void sendProofEmail_whenProofUrlsEmpty_throws_andDoesNotSendEmail() {
        // Arrange
        ProofOfDisplayRequest request = new ProofOfDisplayRequest();
        request.setMediaId(mediaUuid.toString());
        request.setCampaignId("camp-123");
        request.setProofImageUrls(List.of());

        Jwt jwt = mockJwtSubjectOnly();

        // Act + Assert
        assertThrows(IllegalArgumentException.class, () -> proofOfDisplayService.sendProofEmail(jwt, request));
        verifyNoInteractions(emailService);
    }

    @Test
    void sendProofEmail_mediaNotFound_throws_andDoesNotSendEmail() {
        // Arrange
        ProofOfDisplayRequest request = new ProofOfDisplayRequest();
        request.setMediaId(mediaUuid.toString());
        request.setCampaignId("camp-123");
        request.setProofImageUrls(List.of("https://img1.example"));

        Jwt jwt = mockJwtSubjectOnly();

        when(mediaRepository.findById(mediaUuid)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(MediaNotFoundException.class, () -> proofOfDisplayService.sendProofEmail(jwt, request));
        verifyNoInteractions(emailService);
    }


    @Test
    void sendProofEmail_campaignNotFound_throws_andDoesNotSendEmail() {
        // Arrange
        ProofOfDisplayRequest request = new ProofOfDisplayRequest();
        request.setMediaId(mediaUuid.toString());
        request.setCampaignId("camp-404");
        request.setProofImageUrls(List.of("https://img1.example"));

        Jwt jwt = mockJwtSubjectOnly();

        Media media = mock(Media.class);
        when(mediaRepository.findById(mediaUuid)).thenReturn(Optional.of(media));

        when(adCampaignRepository.findByCampaignId_CampaignId("camp-404")).thenReturn(null);

        // Act + Assert
        assertThrows(AdCampaignNotFoundException.class, () -> proofOfDisplayService.sendProofEmail(jwt, request));
        verifyNoInteractions(emailService);
    }

    @Test
    void sendProofEmail_noAdvertiserEmail_throws_andDoesNotSendEmail() {
        // Arrange
        ProofOfDisplayRequest request = new ProofOfDisplayRequest();
        request.setMediaId(mediaUuid.toString());
        request.setCampaignId("camp-123");
        request.setProofImageUrls(List.of("https://img1.example"));

        Jwt jwt = mockJwtPassingAuth();

        Media media = mock(Media.class);
        when(media.getBusinessId()).thenReturn(UUID.randomUUID());
        when(mediaRepository.findById(mediaUuid)).thenReturn(Optional.of(media));

        AdCampaign campaign = mock(AdCampaign.class);

        BusinessIdentifier businessIdentifier = mock(BusinessIdentifier.class);
        when(businessIdentifier.getBusinessId()).thenReturn("biz-999");
        when(campaign.getBusinessId()).thenReturn(businessIdentifier);

        when(adCampaignRepository.findByCampaignId_CampaignId("camp-123")).thenReturn(campaign);

        Employee e1 = mock(Employee.class);
        when(e1.getEmail()).thenReturn("   ");
        Employee e2 = mock(Employee.class);
        when(e2.getEmail()).thenReturn(null);

        when(employeeRepository.findAllByBusinessId_BusinessId("biz-999")).thenReturn(List.of(e1, e2));

        when(reservationRepository.existsConfirmedReservationForMediaAndCampaign(mediaUuid, "camp-123"))
                .thenReturn(true);

        // Act + Assert
        assertThrows(AdvertiserEmailNotFoundException.class, () -> proofOfDisplayService.sendProofEmail(jwt, request));
        verifyNoInteractions(emailService);
    }

    @Test
    void sendProofEmail_employeeRepoThrows_propagates_andDoesNotSendEmail() {
        // Arrange
        ProofOfDisplayRequest request = new ProofOfDisplayRequest();
        request.setMediaId(mediaUuid.toString());
        request.setCampaignId("camp-123");
        request.setProofImageUrls(List.of("https://img1.example"));

        Jwt jwt = mockJwtPassingAuth();

        Media media = mock(Media.class);
        when(media.getBusinessId()).thenReturn(UUID.randomUUID());
        when(mediaRepository.findById(mediaUuid)).thenReturn(Optional.of(media));

        AdCampaign campaign = mock(AdCampaign.class);

        BusinessIdentifier businessIdentifier = mock(BusinessIdentifier.class);
        when(businessIdentifier.getBusinessId()).thenReturn("biz-999");
        when(campaign.getBusinessId()).thenReturn(businessIdentifier);

        when(adCampaignRepository.findByCampaignId_CampaignId("camp-123")).thenReturn(campaign);

        when(employeeRepository.findAllByBusinessId_BusinessId("biz-999"))
                .thenThrow(new RuntimeException("DB down"));

        when(reservationRepository.existsConfirmedReservationForMediaAndCampaign(mediaUuid, "camp-123"))
                .thenReturn(true);

        // Act + Assert
        assertThrows(RuntimeException.class, () -> proofOfDisplayService.sendProofEmail(jwt, request));
        verifyNoInteractions(emailService);
    }
}
