package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.payment.businesslogiclayer.exceptions.*;
import com.envisionad.webservice.payment.dataaccesslayer.*;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.envisionad.webservice.utils.JwtUtils;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.param.*;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.net.RequestOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class StripeServiceImpl implements StripeService {
    private final StripeAccountRepository stripeAccountRepository;
    private final PaymentIntentRepository paymentIntentRepository;
    private final AdCampaignRepository adCampaignRepository;
    private final MediaRepository mediaRepository;
    private final JwtUtils jwtUtils;


    @Value("${stripe.platform-fee-percent}")
    private int platformFeePercent;

    public StripeServiceImpl(StripeAccountRepository stripeAccountRepository,
                             PaymentIntentRepository paymentIntentRepository,
                             AdCampaignRepository adCampaignRepository,
                             MediaRepository mediaRepository,
                             JwtUtils jwtUtils) {
        this.stripeAccountRepository = stripeAccountRepository;
        this.paymentIntentRepository = paymentIntentRepository;
        this.adCampaignRepository = adCampaignRepository;
        this.mediaRepository = mediaRepository;
        this.jwtUtils = jwtUtils;
    }
    @Transactional
    @Override
    public String createConnectedAccount(String businessId) {
        // Check if account already exists
        return stripeAccountRepository.findByBusinessId(businessId)
                .map(StripeAccount::getStripeAccountId)
                .orElseGet(() -> {
                    try {
                        AccountCreateParams params = AccountCreateParams.builder()
                                .setType(AccountCreateParams.Type.EXPRESS)
                                .setCapabilities(
                                        AccountCreateParams.Capabilities.builder()
                                                .setCardPayments(
                                                        AccountCreateParams.Capabilities.CardPayments.builder()
                                                                .setRequested(true)
                                                                .build()
                                                )
                                                .setTransfers(
                                                        AccountCreateParams.Capabilities.Transfers.builder()
                                                                .setRequested(true)
                                                                .build()
                                                )
                                                .build()
                                )
                                .build();

                        Account account = Account.create(params);

                        StripeAccount stripeAccount = new StripeAccount();
                        stripeAccount.setBusinessId(businessId);
                        stripeAccount.setStripeAccountId(account.getId());
                        stripeAccount.setOnboardingComplete(false);
                        stripeAccountRepository.save(stripeAccount);

                        return account.getId();
                    } catch (StripeException e) {
                        throw new RuntimeException("Failed to create Stripe account", e);
                    }
                });
    }

    public String createAccountLink(String stripeAccountId, String returnUrl, String refreshUrl) throws StripeException {
        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(stripeAccountId)
                .setRefreshUrl(refreshUrl)
                .setReturnUrl(returnUrl)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();

        AccountLink accountLink = AccountLink.create(params);
        return accountLink.getUrl();
    }

    @Transactional
    @Override
    public Map<String, String> createPaymentIntent(String reservationId, BigDecimal amount,
                                                   String connectedAccountId) throws StripeException {
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        long platformFee = (amountInCents * platformFeePercent) / 100;

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setApplicationFeeAmount(platformFee)
                .setTransferData(
                        PaymentIntentCreateParams.TransferData.builder()
                                .setDestination(connectedAccountId)
                                .build()
                )
                .putMetadata("reservationId", reservationId)
                .build();

        com.stripe.model.PaymentIntent stripeIntent = com.stripe.model.PaymentIntent.create(params);

        // Save to database
        PaymentIntent paymentIntent = new PaymentIntent();
        paymentIntent.setStripePaymentIntentId(stripeIntent.getId());
        paymentIntent.setReservationId(reservationId);
        paymentIntent.setAmount(amount);
        paymentIntent.setStatus(PaymentStatus.PENDING);
        paymentIntent.setCreatedAt(LocalDateTime.now());
        paymentIntentRepository.save(paymentIntent);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", stripeIntent.getClientSecret());
        response.put("paymentIntentId", stripeIntent.getId());
        return response;
    }

    /**
     * Get Stripe account status for a business
     */
    public Map<String, Object> getAccountStatus(String businessId) {
        Map<String, Object> status = new HashMap<>();

        Optional<StripeAccount> accountOpt = stripeAccountRepository.findByBusinessId(businessId);

        if (accountOpt.isEmpty()) {
            status.put("connected", false);
            status.put("onboardingComplete", false);
            status.put("chargesEnabled", false);
            status.put("payoutsEnabled", false);
        } else {
            StripeAccount account = accountOpt.get();
            status.put("connected", true);
            status.put("onboardingComplete", account.isOnboardingComplete());
            status.put("chargesEnabled", account.isChargesEnabled());
            status.put("payoutsEnabled", account.isPayoutsEnabled());
            status.put("stripeAccountId", account.getStripeAccountId());
        }

        return status;
    }

    @Transactional
    @Override
    public Map<String, String> createCheckoutSession(String reservationId, BigDecimal amount, String businessId) throws StripeException {
        // Validate amount
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidPricingException(amount);
        }

        // Check for duplicate payment attempt (idempotency check)
        Optional<PaymentIntent> existingPayment = paymentIntentRepository.findByReservationId(reservationId);
        if (existingPayment.isPresent() &&
            (existingPayment.get().getStatus() == PaymentStatus.PENDING ||
             existingPayment.get().getStatus() == PaymentStatus.SUCCEEDED)) {
            log.warn("Duplicate payment attempt detected for reservation: {}", reservationId);
            throw new DuplicatePaymentException(reservationId);
        }

        // Fetch Stripe account for the business
        StripeAccount stripeAccount = stripeAccountRepository.findByBusinessId(businessId)
                .orElseThrow(() -> new StripeAccountNotFoundException(businessId));

        if (!stripeAccount.isOnboardingComplete()) {
            throw new StripeOnboardingIncompleteException(businessId);
        }

        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        long platformFee = (amountInCents * platformFeePercent) / 100;

        // Deterministic idempotency key: same reservation -> same key to prevent duplicate charges
        String idempotencyKey = reservationId + "-checkout";
        RequestOptions requestOptions = RequestOptions.builder()
                .setIdempotencyKey(idempotencyKey)
                .build();

        log.info("Creating checkout session for reservation: {}, amount: ${}, business: {}",
                 reservationId, amount, businessId);

        // Create Checkout Session in Embedded Mode (renders in your frontend)
        // Note: redirect_on_completion: never allows us to use onComplete callback instead of redirect
        SessionCreateParams params =
            SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setUiMode(SessionCreateParams.UiMode.EMBEDDED) // Embedded mode
                .setRedirectOnCompletion(SessionCreateParams.RedirectOnCompletion.NEVER) // Stay in modal, use onComplete callback
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(Currency.CAD.toString())
                                .setUnitAmount(amountInCents)
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Media Reservation")
                                        .setDescription("Reservation ID: " + reservationId)
                                        .build()
                                )
                                .build()
                        )
                        .setQuantity(1L)
                        .build()
                )
                .setPaymentIntentData(
                    SessionCreateParams.PaymentIntentData.builder()
                        .setApplicationFeeAmount(platformFee)
                        .setTransferData(
                            SessionCreateParams.PaymentIntentData.TransferData.builder()
                                .setDestination(stripeAccount.getStripeAccountId())
                                .build()
                        )
                        .putMetadata("reservationId", reservationId)
                        .putMetadata("businessId", businessId)
                        .build()
                )
                .build();

        Session session = Session.create(params, requestOptions);

        // In embedded mode, payment_intent is not immediately available
        // We'll track it via session ID and update via webhook
        log.info("Checkout session created: {}", session.getId());

        // Save payment intent info to database with session ID
        PaymentIntent paymentIntent = new PaymentIntent();
        paymentIntent.setStripeSessionId(session.getId());
        paymentIntent.setReservationId(reservationId);
        paymentIntent.setAmount(amount);
        paymentIntent.setStatus(PaymentStatus.PENDING);
        paymentIntent.setCreatedAt(LocalDateTime.now());
        paymentIntentRepository.save(paymentIntent);

        log.info("Checkout session created successfully: {} for reservation: {}", session.getId(), reservationId);

        // Return client_secret for embedded checkout (frontend will render Stripe UI)
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", session.getClientSecret()); // For EmbeddedCheckoutProvider
        response.put("sessionId", session.getId());
        return response;
    }


    @Transactional
    @Override
    public Map<String, String> createAuthorizedCheckoutSession(String userId, String campaignId,
                                                               String mediaId, String reservationId,
                                                               LocalDateTime startDate, LocalDateTime endDate) throws StripeException {
        log.debug("Starting authorized checkout session creation for user: {}, campaign: {}, media: {}",
                  userId, campaignId, mediaId);

        // 1. Validate that the campaign exists
        AdCampaign campaign = adCampaignRepository.findByCampaignId_CampaignId(campaignId);
        if (campaign == null) {
            log.warn("Payment attempt for non-existent campaign: {} by user: {}", campaignId, userId);
            throw new AdCampaignNotFoundException("Campaign not found: " + campaignId);
        }

        // 2. SECURITY: Validate that the user owns this campaign (is employee of the advertiser business)
        String advertiserBusinessId = campaign.getBusinessId().getBusinessId();
        jwtUtils.validateUserIsEmployeeOfBusiness(userId, advertiserBusinessId);
        log.info("User {} authorized to create payment for campaign {} (business: {})",
                 userId, campaignId, advertiserBusinessId);

        // 3. Validate that the media exists and get its business ID and price (don't trust frontend)
        UUID mediaUuid = UUID.fromString(mediaId);
        Media media = mediaRepository.findById(mediaUuid)
                .orElseThrow(() -> {
                    log.warn("Payment attempt for non-existent media: {} by user: {}", mediaId, userId);
                    return new MediaNotFoundException("Media not found: " + mediaId);
                });

        // 4. Get the media owner's business ID from the database (server-side source of truth)
        String mediaOwnerBusinessId = media.getBusinessId().toString();
        log.info("Creating payment for media {} (owner: {}) from advertiser business: {}",
                 mediaId, mediaOwnerBusinessId, advertiserBusinessId);

        // 5. SECURITY: Calculate price on the backend based on media data (not frontend)
        BigDecimal calculatedAmount = calculatePriceFromDates(media.getPrice(), startDate, endDate);
        log.info("Calculated payment amount: ${} for media: {} (duration: {} to {})",
                 calculatedAmount, mediaId, startDate, endDate);

        // 6. Create the checkout session with server-calculated price
        return createCheckoutSession(reservationId, calculatedAmount, mediaOwnerBusinessId);
    }

    /**
     * Calculate price based on media price and reservation date range.
     * Uses the same logic as frontend for consistency but executed server-side for security.
     *
     * @param mediaPrice The base price of the media
     * @param startDate The reservation start date
     * @param endDate The reservation end date
     * @return Calculated total price
     */
    private BigDecimal calculatePriceFromDates(BigDecimal mediaPrice, LocalDateTime startDate, LocalDateTime endDate) {
        // Validate inputs
        if (mediaPrice == null || mediaPrice.compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid media price: {}", mediaPrice);
            throw new InvalidPricingException(mediaPrice);
        }

        if (startDate == null || endDate == null) {
            log.error("Invalid date range: start={}, end={}", startDate, endDate);
            throw new InvalidPricingException(BigDecimal.ZERO);
        }

        // Calculate duration in days using Java time API
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(
            startDate.toLocalDate(),
            endDate.toLocalDate()
        );

        if (totalDays < 0) {
            log.error("Invalid date range: end date is before start date");
            throw new InvalidPricingException(BigDecimal.ZERO);
        }

        // Calculate weeks using the SAME formula as frontend: Math.ceil(days / 7.0)
        long weeks = Math.max(1, (long) Math.ceil(totalDays / 7.0));

        // Calculate total using BigDecimal for precision
        BigDecimal totalPrice = mediaPrice.multiply(BigDecimal.valueOf(weeks));

        log.info("Price calculation: mediaPrice={}, days={}, weeks={}, total={}",
                 mediaPrice, totalDays, weeks, totalPrice);

        return totalPrice;
    }
}
