package com.envisionad.webservice.business.exceptions;

public class BusinessNotFoundException extends RuntimeException {
    public BusinessNotFoundException() {
        super("Business Not Found");
    }
}