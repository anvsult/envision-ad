package com.envisionad.webservice.reservation.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Media does not have enough loop duration left for the requested reservation period")
public class InsufficientLoopDurationException extends RuntimeException {
    public InsufficientLoopDurationException() {
        super("Media does not have enough loop duration left for the requested reservation period");
    }
}

