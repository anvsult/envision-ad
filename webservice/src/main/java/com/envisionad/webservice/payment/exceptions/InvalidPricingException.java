package com.envisionad.webservice.payment.exceptions;

import java.math.BigDecimal;

/**
 * Exception thrown when payment amount is invalid (e.g., negative or zero).
 */
public class InvalidPricingException extends RuntimeException {
    public InvalidPricingException(BigDecimal amount) {
        super("Invalid payment amount: " + amount + ". Amount must be greater than zero.");
    }
}

