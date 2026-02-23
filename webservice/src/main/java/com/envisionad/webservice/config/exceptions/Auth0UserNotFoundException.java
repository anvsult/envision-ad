package com.envisionad.webservice.config.exceptions;

public class Auth0UserNotFoundException extends RuntimeException {

    public Auth0UserNotFoundException(String userId, Throwable cause) {
        super("Auth0 user not found for userId: " + userId, cause);
    }
}

