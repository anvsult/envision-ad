package com.envisionad.webservice.business.exceptions;

public class BusinessEmployeeNotFoundException extends RuntimeException {
    public BusinessEmployeeNotFoundException() {
        super("Employee not found");
    }
}
