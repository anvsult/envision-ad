package com.envisionad.webservice.business.exceptions;

public class BusinessEmployeeNotFoundException extends RuntimeException {
    public BusinessEmployeeNotFoundException(String businessId, String employeeId) {
        super("Business with id=" + businessId + " doesn't have an employee with employeeId=" + employeeId);
    }
}
