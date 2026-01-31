package com.envisionad.webservice.payment.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class StripeAccountNotOnboardedException extends RuntimeException {
    public StripeAccountNotOnboardedException(String message) {
        super(message);
    }
}
