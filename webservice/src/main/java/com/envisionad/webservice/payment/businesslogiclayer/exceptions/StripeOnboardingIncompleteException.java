package com.envisionad.webservice.payment.businesslogiclayer.exceptions;

/**
 * Exception thrown when a business has not completed Stripe onboarding.
 */
public class StripeOnboardingIncompleteException extends RuntimeException {
    public StripeOnboardingIncompleteException(String businessId) {
        super("Business with ID '" + businessId + "' has not completed Stripe onboarding");
    }
}
