package com.envisionad.webservice.business.exceptions;

import java.util.UUID;

public class DuplicateBusinessNameException extends RuntimeException {
    public DuplicateBusinessNameException(String name) {
        super("Business with name=" + name + " already exists");
    }
}
