package com.envisionad.webservice.payment.businesslogiclayer.exceptions;

/**
 * Exception thrown when a business does not have a connected Stripe account.
 */
public class StripeAccountNotFoundException extends RuntimeException {
    public StripeAccountNotFoundException(String businessId) {
        super("Business with ID '" + businessId + "' has not connected a Stripe account");
    }
}
