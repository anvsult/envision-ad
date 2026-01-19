package com.envisionad.webservice.business.exceptions;

public class BusinessEmployeeNotFoundException extends RuntimeException {
    public BusinessEmployeeNotFoundException(String employeeId) {
        super("Employee with ID " + employeeId + " not found in the business.");
    }
}
