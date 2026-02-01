package com.envisionad.webservice.payment.businesslogiclayer;

import com.stripe.exception.StripeException;
import org.springframework.security.oauth2.jwt.Jwt;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public interface StripeService {
    String createConnectedAccount(Jwt jwt, String businessId);

    String createAccountLink(String stripeAccountId, String returnUrl, String refreshUrl) throws StripeException;

    /**
     * Create connected account and return onboarding url and account id in a map
     */
    Map<String, String> createConnectedAccountAndLink(Jwt jwt, String businessId, String returnUrl, String refreshUrl)
            throws StripeException;

    Map<String, String> createCheckoutSession(String reservationId, BigDecimal amount, String businessId)
            throws StripeException;

    Map<String, String> createAuthorizedCheckoutSession(Jwt jwt, String campaignId, String mediaId,
            String reservationId,
            LocalDateTime startDate, LocalDateTime endDate) throws StripeException;

    /**
     * Get Stripe account status for a business
     */
    Map<String, Object> getAccountStatus(Jwt jwt, String businessId);

    Map<String, Object> getDashboardData(Jwt jwt, String businessId, String period) throws StripeException;

}
