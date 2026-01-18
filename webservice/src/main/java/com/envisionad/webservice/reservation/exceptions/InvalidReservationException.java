package com.envisionad.webservice.reservation.exceptions;

public class InvalidReservationException extends RuntimeException {
    public InvalidReservationException() {
        super("Invalid Reservation Request");
    }
}
