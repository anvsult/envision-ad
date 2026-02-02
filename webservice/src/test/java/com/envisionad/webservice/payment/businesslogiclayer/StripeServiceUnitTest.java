package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignIdentifier;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccount;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccountRepository;
import com.envisionad.webservice.utils.JwtUtils;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.payment.exceptions.DuplicatePaymentException;
import com.envisionad.webservice.payment.exceptions.InvalidPricingException;
import com.envisionad.webservice.payment.exceptions.StripeAccountNotFoundException;
import com.envisionad.webservice.payment.exceptions.StripeOnboardingIncompleteException;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.model.BalanceTransaction;
import com.stripe.model.BalanceTransactionCollection;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.BalanceTransactionListParams;
import com.stripe.net.RequestOptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

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
        private ReservationRepository reservationRepository;

        @Mock
        private JwtUtils jwtUtils;

        @BeforeEach
        void setUp() {
                stripeService = new StripeServiceImpl(stripeAccountRepository, paymentIntentRepository,
                                adCampaignRepository, mediaRepository, reservationRepository, jwtUtils);
                // set platform fee percent for deterministic behavior
                org.springframework.test.util.ReflectionTestUtils.setField(stripeService, "platformFeePercent", 30);
        }

        @Test
        void createAuthorizedCheckoutSession_validatesAuthorizationAndCalculatesPrice() throws Exception {
                String userId = "user-1";
                String campaignId = "camp-1";
                String mediaId = UUID.randomUUID().toString();
                String reservationId = "res-1";
                LocalDateTime start = LocalDateTime.of(2026, 1, 1, 0, 0);
                LocalDateTime end = LocalDateTime.of(2026, 1, 8, 0, 0); // 7 days -> 1 week

                // Create a Jwt with the sub claim so the service can extract user id
                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                AdCampaign campaign = new AdCampaign();
                campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
                // advertiser business id
                campaign.setBusinessId(
                                new com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier("biz-1"));

                when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
                // jwtUtils.validateUserIsEmployeeOfBusiness should be called; stub to do
                // nothing
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(eq(userId), anyString());
                when(jwtUtils.extractUserId(eq(jwt))).thenReturn(userId);

                Media media = new Media();
                media.setId(UUID.fromString(mediaId));
                media.setPrice(BigDecimal.valueOf(100)); // 100 dollars per week
                media.setBusinessId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
                when(mediaRepository.findById(UUID.fromString(mediaId))).thenReturn(Optional.of(media));

                // Spy stripeService to avoid calling actual Stripe APIs in
                // createCheckoutSession
                StripeServiceImpl spyService = spy(stripeService);
                doReturn(Map.of("clientSecret", "cs_test", "sessionId", "sess_123")).when(spyService)
                                .createCheckoutSession(anyString(), any(), anyString());

                Map<String, String> result = spyService.createAuthorizedCheckoutSession(jwt, campaignId, mediaId,
                                reservationId, start, end);

                assertNotNull(result.get("clientSecret"));
                verify(jwtUtils, times(1)).validateUserIsEmployeeOfBusiness(eq(userId), anyString());
                // price: 1 week * 100 = 100
        }

        @Test
        void createAuthorizedCheckoutSession_throwsWhenCampaignMissing() {
                String userId = "user-1";
                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                when(adCampaignRepository.findByCampaignId_CampaignId("missing")).thenReturn(null);

                assertThrows(AdCampaignNotFoundException.class,
                                () -> stripeService.createAuthorizedCheckoutSession(jwt, "missing", "mediaId", "res",
                                                LocalDateTime.now(), LocalDateTime.now().plusDays(1)));
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

        @Test
        void createCheckoutSession_throwsInvalidPricingException_whenAmountIsNull() {
                // Given
                String reservationId = "res-invalid-1";
                BigDecimal nullAmount = null;
                String businessId = "biz-1";

                // When & Then
                InvalidPricingException exception = assertThrows(InvalidPricingException.class,
                                () -> stripeService.createCheckoutSession(reservationId, nullAmount, businessId));

                assertNotNull(exception.getMessage());
                assertTrue(exception.getMessage().contains("Invalid payment amount"));
        }

        @Test
        void createCheckoutSession_throwsInvalidPricingException_whenAmountIsZero() {
                // Given
                String reservationId = "res-invalid-2";
                BigDecimal zeroAmount = BigDecimal.ZERO;
                String businessId = "biz-1";

                // When & Then
                InvalidPricingException exception = assertThrows(InvalidPricingException.class,
                                () -> stripeService.createCheckoutSession(reservationId, zeroAmount, businessId));

                assertNotNull(exception.getMessage());
                assertTrue(exception.getMessage().contains("Invalid payment amount"));
        }

        @Test
        void createCheckoutSession_throwsInvalidPricingException_whenAmountIsNegative() {
                // Given
                String reservationId = "res-invalid-3";
                BigDecimal negativeAmount = BigDecimal.valueOf(-50.00);
                String businessId = "biz-1";

                // When & Then
                InvalidPricingException exception = assertThrows(InvalidPricingException.class,
                                () -> stripeService.createCheckoutSession(reservationId, negativeAmount, businessId));

                assertNotNull(exception.getMessage());
                assertTrue(exception.getMessage().contains("Invalid payment amount"));
                assertTrue(exception.getMessage().contains("-50"));
        }

        @Test
        void createCheckoutSession_throwsDuplicatePaymentException_whenPaymentAlreadyExists() {
                // Given
                String reservationId = "res-duplicate";
                BigDecimal amount = BigDecimal.valueOf(100.00);
                String businessId = "biz-1";

                PaymentIntent existingPayment = new PaymentIntent();
                existingPayment.setReservationId(reservationId);
                existingPayment.setStatus(PaymentStatus.PENDING);

                when(paymentIntentRepository.findByReservationId(reservationId))
                                .thenReturn(Optional.of(existingPayment));

                // When & Then
                DuplicatePaymentException exception = assertThrows(DuplicatePaymentException.class,
                                () -> stripeService.createCheckoutSession(reservationId, amount, businessId));

                assertNotNull(exception.getMessage());
                assertTrue(exception.getMessage().contains("A payment already exists for reservation ID"));
                assertTrue(exception.getMessage().contains(reservationId));
        }

        @Test
        void createCheckoutSession_throwsDuplicatePaymentException_whenPaymentSucceeded() {
                // Given
                String reservationId = "res-succeeded";
                BigDecimal amount = BigDecimal.valueOf(100.00);
                String businessId = "biz-1";

                PaymentIntent existingPayment = new PaymentIntent();
                existingPayment.setReservationId(reservationId);
                existingPayment.setStatus(PaymentStatus.SUCCEEDED);

                when(paymentIntentRepository.findByReservationId(reservationId))
                                .thenReturn(Optional.of(existingPayment));

                // When & Then
                DuplicatePaymentException exception = assertThrows(DuplicatePaymentException.class,
                                () -> stripeService.createCheckoutSession(reservationId, amount, businessId));

                assertNotNull(exception.getMessage());
                assertTrue(exception.getMessage().contains(reservationId));
        }

        @Test
        void createCheckoutSession_throwsStripeAccountNotFoundException_whenNoAccountExists() {
                // Given
                String reservationId = "res-no-account";
                BigDecimal amount = BigDecimal.valueOf(100.00);
                String businessId = "biz-no-stripe";

                when(paymentIntentRepository.findByReservationId(reservationId))
                                .thenReturn(Optional.empty());
                when(stripeAccountRepository.findByBusinessId(businessId))
                                .thenReturn(Optional.empty());

                // When & Then
                StripeAccountNotFoundException exception = assertThrows(StripeAccountNotFoundException.class,
                                () -> stripeService.createCheckoutSession(reservationId, amount, businessId));

                assertNotNull(exception.getMessage());
                assertTrue(exception.getMessage().contains("has not connected a Stripe account"));
                assertTrue(exception.getMessage().contains(businessId));
        }

        @Test
        void createCheckoutSession_shouldReusePaymentIntentRecord_whenRetryingFailedPayment() throws StripeException {
                // Given: A failed payment attempt exists
                String reservationId = "res-retry-failed";
                BigDecimal amount = BigDecimal.valueOf(100.00);
                String businessId = "biz-1";
                Long existingPaymentIntentId = 123L;

                PaymentIntent existingFailedPayment = new PaymentIntent();
                existingFailedPayment.setId(existingPaymentIntentId);
                existingFailedPayment.setReservationId(reservationId);
                existingFailedPayment.setBusinessId(businessId);
                existingFailedPayment.setAmount(BigDecimal.valueOf(100.00));
                existingFailedPayment.setStatus(PaymentStatus.FAILED);
                existingFailedPayment.setStripePaymentIntentId("pi_old_failed");
                existingFailedPayment.setStripeSessionId("sess_old_failed");
                existingFailedPayment.setCreatedAt(LocalDateTime.now().minusHours(1));

                StripeAccount stripeAccount = new StripeAccount();
                stripeAccount.setBusinessId(businessId);
                stripeAccount.setStripeAccountId("acct_123");
                stripeAccount.setOnboardingComplete(true);
                stripeAccount.setChargesEnabled(true);

                when(paymentIntentRepository.findByReservationId(reservationId))
                                .thenReturn(Optional.of(existingFailedPayment));
                when(stripeAccountRepository.findByBusinessId(businessId))
                                .thenReturn(Optional.of(stripeAccount));

                // Mock Stripe session creation
                com.stripe.model.checkout.Session mockSession = mock(com.stripe.model.checkout.Session.class);
                when(mockSession.getId()).thenReturn("sess_new_retry_123");
                when(mockSession.getClientSecret()).thenReturn("cs_test_retry_secret");

                try (MockedStatic<com.stripe.model.checkout.Session> sessionMock = mockStatic(
                                com.stripe.model.checkout.Session.class)) {
                        sessionMock.when(() -> com.stripe.model.checkout.Session.create(
                                        any(com.stripe.param.checkout.SessionCreateParams.class),
                                        any(RequestOptions.class)))
                                        .thenReturn(mockSession);

                        // When: Retry payment for failed reservation
                        Map<String, String> result = stripeService.createCheckoutSession(reservationId, amount,
                                        businessId);

                        // Then: Should return new session details
                        assertNotNull(result);
                        assertEquals("cs_test_retry_secret", result.get("clientSecret"));
                        assertEquals("sess_new_retry_123", result.get("sessionId"));

                        // Verify that the existing PaymentIntent record was updated (not inserted as
                        // new)
                        verify(paymentIntentRepository).save(argThat(pi -> pi.getId().equals(existingPaymentIntentId) && // Same
                                                                                                                         // ID
                                                                                                                         // =
                                                                                                                         // UPDATE
                                                                                                                         // operation
                                        pi.getReservationId().equals(reservationId) &&
                                        pi.getStatus() == PaymentStatus.PENDING && // Status reset to PENDING
                                        pi.getStripeSessionId().equals("sess_new_retry_123") && // New session ID
                                        pi.getStripePaymentIntentId() == null // Old Stripe PI ID cleared (will be set
                                                                              // by webhook)
                        ));

                        // Verify no duplicate was created (save called only once)
                        verify(paymentIntentRepository, times(1)).save(any(PaymentIntent.class));
                }
        }

        @Test
        void createCheckoutSession_shouldReuseCanceledPaymentIntent_whenRetrying() throws StripeException {
                // Given: A canceled payment attempt exists
                String reservationId = "res-retry-canceled";
                BigDecimal amount = BigDecimal.valueOf(150.00);
                String businessId = "biz-1";
                Long existingPaymentIntentId = 456L;

                PaymentIntent existingCanceledPayment = new PaymentIntent();
                existingCanceledPayment.setId(existingPaymentIntentId);
                existingCanceledPayment.setReservationId(reservationId);
                existingCanceledPayment.setBusinessId(businessId);
                existingCanceledPayment.setAmount(BigDecimal.valueOf(150.00));
                existingCanceledPayment.setStatus(PaymentStatus.CANCELED);
                existingCanceledPayment.setStripePaymentIntentId("pi_old_canceled");
                existingCanceledPayment.setStripeSessionId("sess_old_canceled");

                StripeAccount stripeAccount = new StripeAccount();
                stripeAccount.setBusinessId(businessId);
                stripeAccount.setStripeAccountId("acct_456");
                stripeAccount.setOnboardingComplete(true);

                when(paymentIntentRepository.findByReservationId(reservationId))
                                .thenReturn(Optional.of(existingCanceledPayment));
                when(stripeAccountRepository.findByBusinessId(businessId))
                                .thenReturn(Optional.of(stripeAccount));

                com.stripe.model.checkout.Session mockSession = mock(com.stripe.model.checkout.Session.class);
                when(mockSession.getId()).thenReturn("sess_new_after_cancel");
                when(mockSession.getClientSecret()).thenReturn("cs_test_cancel_retry");

                try (MockedStatic<com.stripe.model.checkout.Session> sessionMock = mockStatic(
                                com.stripe.model.checkout.Session.class)) {
                        sessionMock.when(() -> com.stripe.model.checkout.Session.create(
                                        any(com.stripe.param.checkout.SessionCreateParams.class),
                                        any(RequestOptions.class)))
                                        .thenReturn(mockSession);

                        // When: Retry payment for canceled reservation
                        Map<String, String> result = stripeService.createCheckoutSession(reservationId, amount,
                                        businessId);

                        // Then: Should successfully reuse the existing record
                        assertNotNull(result);
                        assertEquals("cs_test_cancel_retry", result.get("clientSecret"));

                        // Verify UPDATE operation (same ID, status changed to PENDING)
                        verify(paymentIntentRepository).save(argThat(pi -> pi.getId().equals(existingPaymentIntentId) &&
                                        pi.getStatus() == PaymentStatus.PENDING &&
                                        pi.getStripePaymentIntentId() == null // Cleared for webhook to set
                        ));
                }
        }

        @Test
        void createAuthorizedCheckoutSession_throwsInvalidPricingException_whenMediaPriceIsNegative() {
                // Given
                String userId = "user-1";
                String campaignId = "camp-1";
                String mediaId = UUID.randomUUID().toString();
                String reservationId = "res-1";
                LocalDateTime start = LocalDateTime.of(2026, 1, 1, 0, 0);
                LocalDateTime end = LocalDateTime.of(2026, 1, 8, 0, 0);

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                AdCampaign campaign = new AdCampaign();
                campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
                campaign.setBusinessId(
                                new com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier("biz-1"));

                Media media = new Media();
                media.setId(UUID.fromString(mediaId));
                media.setPrice(BigDecimal.valueOf(-100)); // Negative price
                media.setBusinessId(UUID.fromString("00000000-0000-0000-0000-000000000001"));

                when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(eq(userId), anyString());
                when(mediaRepository.findById(UUID.fromString(mediaId))).thenReturn(Optional.of(media));

                // When & Then
                InvalidPricingException exception = assertThrows(InvalidPricingException.class,
                                () -> stripeService.createAuthorizedCheckoutSession(jwt, campaignId, mediaId,
                                                reservationId, start, end));

                assertNotNull(exception.getMessage());
                assertTrue(exception.getMessage().contains("Invalid payment amount"));
        }

        @Test
        void createAuthorizedCheckoutSession_throwsInvalidPricingException_whenMediaPriceIsZero() {
                // Given
                String userId = "user-1";
                String campaignId = "camp-1";
                String mediaId = UUID.randomUUID().toString();
                String reservationId = "res-1";
                LocalDateTime start = LocalDateTime.of(2026, 1, 1, 0, 0);
                LocalDateTime end = LocalDateTime.of(2026, 1, 8, 0, 0);

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                AdCampaign campaign = new AdCampaign();
                campaign.setCampaignId(new AdCampaignIdentifier(campaignId));
                campaign.setBusinessId(
                                new com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier("biz-1"));

                Media media = new Media();
                media.setId(UUID.fromString(mediaId));
                media.setPrice(BigDecimal.ZERO); // Zero price
                media.setBusinessId(UUID.fromString("00000000-0000-0000-0000-000000000001"));

                when(adCampaignRepository.findByCampaignId_CampaignId(campaignId)).thenReturn(campaign);
                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(eq(userId), anyString());
                when(mediaRepository.findById(UUID.fromString(mediaId))).thenReturn(Optional.of(media));

                // When & Then
                InvalidPricingException exception = assertThrows(InvalidPricingException.class,
                                () -> stripeService.createAuthorizedCheckoutSession(jwt, campaignId, mediaId,
                                                reservationId, start, end));

                assertNotNull(exception.getMessage());
                assertTrue(exception.getMessage().contains("Invalid payment amount"));
        }

        // ========== Tests for createConnectedAccount ==========

        @Test
        void createConnectedAccount_shouldReturnExistingAccountId_whenAccountExists() {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String existingAccountId = "acct_existing123";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount existingAccount = new StripeAccount();
                existingAccount.setBusinessId(businessId);
                existingAccount.setStripeAccountId(existingAccountId);
                existingAccount.setOnboardingComplete(true);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(existingAccount));

                // When
                String result = stripeService.createConnectedAccount(jwt, businessId);

                // Then
                assertEquals(existingAccountId, result);
                verify(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                verify(stripeAccountRepository).findByBusinessId(businessId);
                verify(stripeAccountRepository, never()).save(any(StripeAccount.class));
        }

        @Test
        void createConnectedAccount_shouldCreateNewAccount_whenAccountDoesNotExist() {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String newAccountId = "acct_new123";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.empty());

                // Mock Stripe Account creation
                Account mockAccount = mock(Account.class);
                when(mockAccount.getId()).thenReturn(newAccountId);

                try (MockedStatic<Account> accountMock = mockStatic(Account.class)) {
                        accountMock.when(() -> Account.create(any(AccountCreateParams.class))).thenReturn(mockAccount);

                        // When
                        String result = stripeService.createConnectedAccount(jwt, businessId);

                        // Then
                        assertEquals(newAccountId, result);
                        verify(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                        verify(stripeAccountRepository).findByBusinessId(businessId);
                        verify(stripeAccountRepository)
                                        .save(argThat(account -> account.getBusinessId().equals(businessId) &&
                                                        account.getStripeAccountId().equals(newAccountId) &&
                                                        !account.isOnboardingComplete()));
                }
        }

        // ========== Tests for createAccountLink ==========

        @Test
        void createAccountLink_shouldReturnOnboardingUrl() throws StripeException {
                // Given
                String stripeAccountId = "acct_123";
                String returnUrl = "https://example.com/return";
                String refreshUrl = "https://example.com/refresh";
                String expectedUrl = "https://connect.stripe.com/setup/test";

                AccountLink mockAccountLink = mock(AccountLink.class);
                when(mockAccountLink.getUrl()).thenReturn(expectedUrl);

                try (MockedStatic<AccountLink> accountLinkMock = mockStatic(AccountLink.class)) {
                        accountLinkMock.when(() -> AccountLink.create(any(AccountLinkCreateParams.class)))
                                        .thenReturn(mockAccountLink);

                        // When
                        String result = stripeService.createAccountLink(stripeAccountId, returnUrl, refreshUrl);

                        // Then
                        assertEquals(expectedUrl, result);
                }
        }

        // ========== Tests for createConnectedAccountAndLink ==========

        @Test
        void createConnectedAccountAndLink_shouldReturnAccountIdAndUrl() throws StripeException {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String accountId = "acct_123";
                String returnUrl = "https://example.com/return";
                String refreshUrl = "https://example.com/refresh";
                String onboardingUrl = "https://connect.stripe.com/setup/test";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount existingAccount = new StripeAccount();
                existingAccount.setBusinessId(businessId);
                existingAccount.setStripeAccountId(accountId);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(existingAccount));

                AccountLink mockAccountLink = mock(AccountLink.class);
                when(mockAccountLink.getUrl()).thenReturn(onboardingUrl);

                try (MockedStatic<AccountLink> accountLinkMock = mockStatic(AccountLink.class)) {
                        accountLinkMock.when(() -> AccountLink.create(any(AccountLinkCreateParams.class)))
                                        .thenReturn(mockAccountLink);

                        // When
                        Map<String, String> result = stripeService.createConnectedAccountAndLink(jwt, businessId,
                                        returnUrl, refreshUrl);

                        // Then
                        assertEquals(accountId, result.get("accountId"));
                        assertEquals(onboardingUrl, result.get("onboardingUrl"));
                        assertEquals(2, result.size());
                }
        }

        // ========== Tests for getAccountStatus ==========

        @Test
        void getAccountStatus_shouldReturnNotConnected_whenAccountDoesNotExist() {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.empty());

                // When
                Map<String, Object> status = stripeService.getAccountStatus(jwt, businessId);

                // Then
                assertEquals(false, status.get("connected"));
                assertEquals(false, status.get("onboardingComplete"));
                assertEquals(false, status.get("chargesEnabled"));
                assertEquals(false, status.get("payoutsEnabled"));
                assertNull(status.get("stripeAccountId"));
                verify(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
        }

        @Test
        void getAccountStatus_shouldReturnConnectedStatus_whenAccountExists() {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String stripeAccountId = "acct_123";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount account = new StripeAccount();
                account.setBusinessId(businessId);
                account.setStripeAccountId(stripeAccountId);
                account.setOnboardingComplete(true);
                account.setChargesEnabled(true);
                account.setPayoutsEnabled(true);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(account));

                // When
                Map<String, Object> status = stripeService.getAccountStatus(jwt, businessId);

                // Then
                assertEquals(true, status.get("connected"));
                assertEquals(true, status.get("onboardingComplete"));
                assertEquals(true, status.get("chargesEnabled"));
                assertEquals(true, status.get("payoutsEnabled"));
                assertEquals(stripeAccountId, status.get("stripeAccountId"));
                verify(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
        }

        @Test
        void getAccountStatus_shouldReturnPartialStatus_whenOnboardingIncomplete() {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String stripeAccountId = "acct_123";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount account = new StripeAccount();
                account.setBusinessId(businessId);
                account.setStripeAccountId(stripeAccountId);
                account.setOnboardingComplete(false);
                account.setChargesEnabled(false);
                account.setPayoutsEnabled(false);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(account));

                // When
                Map<String, Object> status = stripeService.getAccountStatus(jwt, businessId);

                // Then
                assertEquals(true, status.get("connected"));
                assertEquals(false, status.get("onboardingComplete"));
                assertEquals(false, status.get("chargesEnabled"));
                assertEquals(false, status.get("payoutsEnabled"));
                assertEquals(stripeAccountId, status.get("stripeAccountId"));
        }

        // ========== Tests for getDashboardData ==========

        @Test
        void getDashboardData_shouldReturnDashboardMetrics_withGrossAndNetEarnings() throws StripeException {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String stripeAccountId = "acct_123";
                String period = "monthly";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount account = new StripeAccount();
                account.setBusinessId(businessId);
                account.setStripeAccountId(stripeAccountId);
                account.setOnboardingComplete(true);

                PaymentIntent payment1 = new PaymentIntent();
                payment1.setAmount(new BigDecimal("100.00"));
                payment1.setStatus(PaymentStatus.SUCCEEDED);
                payment1.setBusinessId(businessId);
                payment1.setCreatedAt(LocalDateTime.now());

                PaymentIntent payment2 = new PaymentIntent();
                payment2.setAmount(new BigDecimal("200.00"));
                payment2.setStatus(PaymentStatus.SUCCEEDED);
                payment2.setBusinessId(businessId);
                payment2.setCreatedAt(LocalDateTime.now());

                List<PaymentIntent> payments = List.of(payment1, payment2);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(account));
                when(paymentIntentRepository.findSuccessfulPaymentsByBusinessIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(payments);

                when(reservationRepository.findConfirmedReservationsByAdvertiserIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(new ArrayList<>());
                when(paymentIntentRepository.findSuccessfulPaymentsByAdvertiserIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(new ArrayList<>());

                BalanceTransactionCollection mockPayouts = mock(BalanceTransactionCollection.class);
                when(mockPayouts.getData()).thenReturn(new ArrayList<>());

                try (MockedStatic<BalanceTransaction> balanceTransactionMock = mockStatic(BalanceTransaction.class)) {
                        balanceTransactionMock.when(() -> BalanceTransaction.list(
                                        any(BalanceTransactionListParams.class), any(RequestOptions.class)))
                                        .thenReturn(mockPayouts);

                        // When
                        Map<String, Object> dashboard = stripeService.getDashboardData(jwt, businessId, period);

                        // Then
                        assertNotNull(dashboard);
                        assertEquals(new BigDecimal("300.00"), dashboard.get("grossEarnings"));

                        // Net earnings = 300 * (100 - 30) / 100 = 300 * 0.7 = 210.00
                        BigDecimal expectedNetEarnings = new BigDecimal("210.00");

                        assertEquals(0, expectedNetEarnings.compareTo((BigDecimal) dashboard.get("netEarnings")));

                        // Platform fee = 300 - 210 = 90.00
                        BigDecimal expectedPlatformFee = new BigDecimal("90.00");
                        assertEquals(0, expectedPlatformFee.compareTo((BigDecimal) dashboard.get("platformFee")));

                        assertEquals(2, dashboard.get("paymentCount"));
                        assertNotNull(dashboard.get("payouts"));

                        verify(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                        verify(paymentIntentRepository).findSuccessfulPaymentsByBusinessIdAndDateRange(
                                        eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class));
                }
        }

        @Test
        void getDashboardData_shouldFilterByWeeklyPeriod() throws StripeException {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String stripeAccountId = "acct_123";
                String period = "weekly";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount account = new StripeAccount();
                account.setBusinessId(businessId);
                account.setStripeAccountId(stripeAccountId);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(account));
                when(paymentIntentRepository.findSuccessfulPaymentsByBusinessIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(Collections.emptyList());

                BalanceTransactionCollection mockPayouts = mock(BalanceTransactionCollection.class);
                when(mockPayouts.getData()).thenReturn(new ArrayList<>());

                try (MockedStatic<BalanceTransaction> balanceTransactionMock = mockStatic(BalanceTransaction.class)) {
                        balanceTransactionMock.when(() -> BalanceTransaction.list(
                                        any(BalanceTransactionListParams.class), any(RequestOptions.class)))
                                        .thenReturn(mockPayouts);

                        // When
                        Map<String, Object> dashboard = stripeService.getDashboardData(jwt, businessId, period);

                        // Then
                        assertNotNull(dashboard);
                        verify(paymentIntentRepository).findSuccessfulPaymentsByBusinessIdAndDateRange(
                                        eq(businessId),
                                        argThat(startDate -> startDate.isBefore(LocalDateTime.now()) &&
                                                        startDate.isAfter(LocalDateTime.now().minusWeeks(2))),
                                        any(LocalDateTime.class));
                }
        }

        @Test
        void getDashboardData_shouldFilterByYearlyPeriod() throws StripeException {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String stripeAccountId = "acct_123";
                String period = "yearly";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount account = new StripeAccount();
                account.setBusinessId(businessId);
                account.setStripeAccountId(stripeAccountId);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(account));
                when(paymentIntentRepository.findSuccessfulPaymentsByBusinessIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(Collections.emptyList());

                BalanceTransactionCollection mockPayouts = mock(BalanceTransactionCollection.class);
                when(mockPayouts.getData()).thenReturn(new ArrayList<>());

                try (MockedStatic<BalanceTransaction> balanceTransactionMock = mockStatic(BalanceTransaction.class)) {
                        balanceTransactionMock.when(() -> BalanceTransaction.list(
                                        any(BalanceTransactionListParams.class), any(RequestOptions.class)))
                                        .thenReturn(mockPayouts);

                        // When
                        Map<String, Object> dashboard = stripeService.getDashboardData(jwt, businessId, period);

                        // Then
                        assertNotNull(dashboard);
                        verify(paymentIntentRepository).findSuccessfulPaymentsByBusinessIdAndDateRange(
                                        eq(businessId),
                                        argThat(startDate -> startDate.isBefore(LocalDateTime.now()) &&
                                                        startDate.isAfter(LocalDateTime.now().minusYears(2))),
                                        any(LocalDateTime.class));
                }
        }

        @Test
        void getDashboardData_shouldDefaultToMonthly_whenInvalidPeriod() throws StripeException {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String stripeAccountId = "acct_123";
                String period = "invalid";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount account = new StripeAccount();
                account.setBusinessId(businessId);
                account.setStripeAccountId(stripeAccountId);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(account));
                when(paymentIntentRepository.findSuccessfulPaymentsByBusinessIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(Collections.emptyList());

                BalanceTransactionCollection mockPayouts = mock(BalanceTransactionCollection.class);
                when(mockPayouts.getData()).thenReturn(new ArrayList<>());

                try (MockedStatic<BalanceTransaction> balanceTransactionMock = mockStatic(BalanceTransaction.class)) {
                        balanceTransactionMock.when(() -> BalanceTransaction.list(
                                        any(BalanceTransactionListParams.class), any(RequestOptions.class)))
                                        .thenReturn(mockPayouts);

                        // When
                        Map<String, Object> dashboard = stripeService.getDashboardData(jwt, businessId, period);

                        // Then - should default to monthly (1 month back)
                        assertNotNull(dashboard);
                        verify(paymentIntentRepository).findSuccessfulPaymentsByBusinessIdAndDateRange(
                                        eq(businessId),
                                        argThat(startDate -> startDate.isBefore(LocalDateTime.now()) &&
                                                        startDate.isAfter(LocalDateTime.now().minusMonths(2))),
                                        any(LocalDateTime.class));
                }
        }

        @Test
        void getDashboardData_shouldReturnAdvertiserDashboard_whenStripeAccountNotFound() throws StripeException {
                // Given
                String userId = "user-1";
                String businessId = "nonexistent-business";
                String period = "monthly";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.empty());

                when(reservationRepository.findConfirmedReservationsByAdvertiserIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(Collections.emptyList());
                when(paymentIntentRepository.findSuccessfulPaymentsByAdvertiserIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(Collections.emptyList());

                // When
                Map<String, Object> dashboard = stripeService.getDashboardData(jwt, businessId, period);

                // Then
                assertNotNull(dashboard);
                assertEquals(false, dashboard.get("isMediaOwner"));
                assertEquals(0, ((BigDecimal) dashboard.get("totalSpend")).compareTo(BigDecimal.ZERO));
        }

        @Test
        void getDashboardData_shouldCalculateZeroEarnings_whenNoPayments() throws StripeException {
                // Given
                String userId = "user-1";
                String businessId = "biz-1";
                String stripeAccountId = "acct_123";
                String period = "monthly";

                org.springframework.security.oauth2.jwt.Jwt jwt = org.springframework.security.oauth2.jwt.Jwt
                                .withTokenValue("token")
                                .header("alg", "none")
                                .claim("sub", userId)
                                .build();

                StripeAccount account = new StripeAccount();
                account.setBusinessId(businessId);
                account.setStripeAccountId(stripeAccountId);

                when(jwtUtils.extractUserId(jwt)).thenReturn(userId);
                doNothing().when(jwtUtils).validateUserIsEmployeeOfBusiness(userId, businessId);
                when(stripeAccountRepository.findByBusinessId(businessId)).thenReturn(Optional.of(account));
                when(paymentIntentRepository.findSuccessfulPaymentsByBusinessIdAndDateRange(
                                eq(businessId), any(LocalDateTime.class), any(LocalDateTime.class)))
                                .thenReturn(Collections.emptyList());

                BalanceTransactionCollection mockPayouts = mock(BalanceTransactionCollection.class);
                when(mockPayouts.getData()).thenReturn(new ArrayList<>());

                try (MockedStatic<BalanceTransaction> balanceTransactionMock = mockStatic(BalanceTransaction.class)) {
                        balanceTransactionMock.when(() -> BalanceTransaction.list(
                                        any(BalanceTransactionListParams.class), any(RequestOptions.class)))
                                        .thenReturn(mockPayouts);

                        // When
                        Map<String, Object> dashboard = stripeService.getDashboardData(jwt, businessId, period);

                        // Then
                        assertEquals(0, ((BigDecimal) dashboard.get("grossEarnings")).compareTo(BigDecimal.ZERO));
                        assertEquals(0, ((BigDecimal) dashboard.get("netEarnings")).compareTo(BigDecimal.ZERO));
                        assertEquals(0, ((BigDecimal) dashboard.get("platformFee")).compareTo(BigDecimal.ZERO));
                        assertEquals(0, dashboard.get("paymentCount"));
                }
        }

}
