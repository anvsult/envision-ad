package com.envisionad.webservice.reservation.exceptions;

public class ReservationConflictException extends RuntimeException {
    public ReservationConflictException() {
        super("This media is already reserved for another campaign during an overlapping date range");
    }
}
