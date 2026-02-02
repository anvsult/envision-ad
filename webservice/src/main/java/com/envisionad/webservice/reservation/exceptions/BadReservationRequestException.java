package com.envisionad.webservice.reservation.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Bad Reservation Request")
public class BadReservationRequestException extends RuntimeException {
    public BadReservationRequestException() {
        super("Bad Reservation Request");
    }
}
