package com.envisionad.webservice.payment.businesslogiclayer;

import com.stripe.exception.StripeException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public interface StripeService {
    String createConnectedAccount(String businessId);

    Map<String, String> createPaymentIntent(String reservationId, BigDecimal amount,
                                            String connectedAccountId) throws StripeException;

    Map<String, String> createCheckoutSession(String reservationId, BigDecimal amount, String businessId) throws StripeException;

    /**
     * Create a checkout session with full authorization validation.
     * Validates that the user owns the campaign and retrieves the media owner's business ID.
     * Backend calculates price from media data based on dates for security.
     *
     * @param userId The authenticated user's ID
     * @param campaignId The campaign ID (must belong to user's business)
     * @param mediaId The media ID (to get owner's business ID and pricing)
     * @param reservationId The reservation ID
     * @param startDate The reservation start date
     * @param endDate The reservation end date
     * @return Map containing sessionUrl and sessionId
     * @throws StripeException if Stripe API fails
     */
    Map<String, String> createAuthorizedCheckoutSession(String userId, String campaignId,
                                                        String mediaId, String reservationId,
                                                        LocalDateTime startDate, LocalDateTime endDate) throws StripeException;
}
