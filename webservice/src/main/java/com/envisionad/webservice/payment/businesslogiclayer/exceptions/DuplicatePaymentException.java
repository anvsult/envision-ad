package com.envisionad.webservice.payment.businesslogiclayer.exceptions;

/**
 * Exception thrown when attempting to create a duplicate payment for the same reservation.
 */
public class DuplicatePaymentException extends RuntimeException {
    public DuplicatePaymentException(String reservationId) {
        super("A payment already exists for reservation ID: " + reservationId);
    }
}

