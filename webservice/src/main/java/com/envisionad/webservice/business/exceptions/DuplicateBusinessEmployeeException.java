package com.envisionad.webservice.business.exceptions;

public class DuplicateBusinessEmployeeException extends RuntimeException {
    public DuplicateBusinessEmployeeException() {
        super("Duplicate business employee");
    }
}
