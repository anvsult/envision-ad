package com.envisionad.webservice.config.exceptions;

public class Auth0ServiceUnavailableException extends RuntimeException {

    public Auth0ServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}

