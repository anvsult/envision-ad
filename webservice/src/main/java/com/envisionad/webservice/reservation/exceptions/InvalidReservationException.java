package com.envisionad.webservice.reservation.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Invalid Reservation Request")
public class InvalidReservationException extends RuntimeException {
    public InvalidReservationException() {
        super("Invalid Reservation Request");
    }
}
