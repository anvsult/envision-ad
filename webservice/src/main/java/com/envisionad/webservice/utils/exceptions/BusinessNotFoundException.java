package com.envisionad.webservice.utils.exceptions;

import java.util.UUID;

public class BusinessNotFoundException extends RuntimeException {
    public BusinessNotFoundException(UUID businessId) {
        super("Business with id=" + businessId + " is not found");
    }
}