package com.envisionad.webservice.reservation.exceptions;

public class ReservationAlreadyProcessedException extends RuntimeException {
    public ReservationAlreadyProcessedException() {
        super("Reservation Status has already been processed");
    }
}
