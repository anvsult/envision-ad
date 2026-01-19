package com.envisionad.webservice.business.exceptions;

public class BusinessAlreadyVerifiedException extends RuntimeException {
    public BusinessAlreadyVerifiedException() {
        super("Business Already Verified");
    }
}
