package com.envisionad.webservice.utils.exceptions;

import java.util.UUID;

public class DuplicateBusinessNameException extends RuntimeException {
    public DuplicateBusinessNameException(String name) {
        super("Business with name=" + name + " already exists");
    }
}
