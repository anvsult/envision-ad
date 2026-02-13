package com.envisionad.webservice.reservation.exceptions;

public class ReservationConflictException extends RuntimeException {
    public ReservationConflictException() {
        super("This media is already reserved for the selected campaign and date range");
    }
}
