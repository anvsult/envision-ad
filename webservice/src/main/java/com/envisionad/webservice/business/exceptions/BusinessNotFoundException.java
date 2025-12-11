package com.envisionad.webservice.business.exceptions;

import java.util.UUID;

public class BusinessNotFoundException extends RuntimeException {
    public BusinessNotFoundException(String businessId) {
        super("Business with id=" + businessId + " is not found");
    }
}