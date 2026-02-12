package com.envisionad.webservice.business.exceptions;

public class BusinessNotFoundException extends RuntimeException {
    public BusinessNotFoundException(String businessId) {
        super("Business with ID " + businessId + " not found.");
    }
}