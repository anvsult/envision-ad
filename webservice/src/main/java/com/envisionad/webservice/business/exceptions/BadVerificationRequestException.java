package com.envisionad.webservice.business.exceptions;

public class BadVerificationRequestException extends RuntimeException {
    public BadVerificationRequestException() {
        super("Bad Verification Request");
    }
}
