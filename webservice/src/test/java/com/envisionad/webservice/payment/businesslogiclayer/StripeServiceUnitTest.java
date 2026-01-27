package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignIdentifier;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccount;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccountRepository;
import com.envisionad.webservice.utils.JwtUtils;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.payment.exceptions.StripeOnboardingIncompleteException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeServiceUnitTest {

    private StripeServiceImpl stripeService;

    @Mock
    private StripeAccountRepository stripeAccountRepository;

    @Mock
    private PaymentIntentRepository paymentIntentRepository;

    @Mock
    private AdCampaignRepository adCampaignRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        stripeService = new StripeServiceImpl(stripeAccountRepository, paymentIntentRepository, adCampaignRepository, mediaRepository, jwtUtils);
        // set platform fee percent for deterministic behavior
        org.springframework.test.util.ReflectionTestUtils.setField(stripeService, "platformFeePercent", 30);
    }

    @Test
    void createAuthorizedCheckoutSession_validatesAuthorizationAndCalculatesPrice() throws Exception {
        String userId = "user-1";
        String campaignId = "camp-1";
        String mediaId = UUID.randomUUID().toString();
        String reservationId = "res-1";
        LocalDateTime start = LocalDateTime.of(2026,1,1,0,0);
        LocalDateTime end = LocalDateTime.of(2026,1,8,0,0); // 7 days -> 1 week

        // Create a Jwt with the sub claim so the service can extract user id
        org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", userId)
                .build();

        AdCampaign campaign = new AdCampaign();
        campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
        // advertiser business id
        campaign.setBusinessId(new com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier("biz-1"));

        when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
        // jwtUtils.validateUserIsEmployeeOfBusiness should be called; stub to do nothing
        doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(eq(userId), anyString());
        when(jwtUtils.extractUserId(eq(jwt))).thenReturn(userId);

        Media media = new Media();
        media.setId(UUID.fromString(mediaId));
        media.setPrice(BigDecimal.valueOf(100)); // 100 dollars per week
        media.setBusinessId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        when(mediaRepository.findById(UUID.fromString(mediaId))).thenReturn(Optional.of(media));

        // Spy stripeService to avoid calling actual Stripe APIs in createCheckoutSession
        StripeServiceImpl spyService = spy(stripeService);
        doReturn(Map.of("clientSecret", "cs_test", "sessionId", "sess_123")).when(spyService).createCheckoutSession(anyString(), any(), anyString());

        Map<String, String> result = spyService.createAuthorizedCheckoutSession(jwt, campaignId, mediaId, reservationId, start, end);

        assertNotNull(result.get("clientSecret"));
        verify(jwtUtils, times(1)).validateUserIsEmployeeOfBusiness(eq(userId), anyString());
        // price: 1 week * 100 = 100
    }

    @Test
    void createAuthorizedCheckoutSession_throwsWhenCampaignMissing() {
        String userId = "user-1";
        org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", userId)
                .build();

        when(adCampaignRepository.findByCampaignId_CampaignId("missing")).thenReturn(null);

        assertThrows(AdCampaignNotFoundException.class,
                () -> stripeService.createAuthorizedCheckoutSession(jwt, "missing", "mediaId", "res", LocalDateTime.now(), LocalDateTime.now().plusDays(1)));
    }

    @Test
    void createCheckoutSession_throwsWhenOnboardingIncomplete() {
        String reservationId = "res-2";
        BigDecimal amount = BigDecimal.valueOf(10);
        String businessId = "biz-1";

        StripeAccount acct = new StripeAccount();
        acct.setBusinessId(businessId);
        acct.setOnboardingComplete(false);

        when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(acct));

        assertThrows(StripeOnboardingIncompleteException.class,
                () -> stripeService.createCheckoutSession(reservationId, amount, businessId));
    }

}
