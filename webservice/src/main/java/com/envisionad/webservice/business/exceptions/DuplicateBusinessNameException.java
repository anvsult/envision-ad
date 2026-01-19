package com.envisionad.webservice.business.exceptions;

public class DuplicateBusinessNameException extends RuntimeException {
    public DuplicateBusinessNameException() {
        super("Duplicate Business Name");
    }
}
