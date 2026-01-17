package com.envisionad.webservice.business.exceptions;

public class VerificationNotFoundException extends RuntimeException {
    public VerificationNotFoundException() {
        super("Verification Not Found");
    }
}
