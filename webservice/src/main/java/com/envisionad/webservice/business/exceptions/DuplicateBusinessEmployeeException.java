package com.envisionad.webservice.business.exceptions;

public class DuplicateBusinessEmployeeException extends RuntimeException {
    public DuplicateBusinessEmployeeException(String businessId, String employeeId) {
        super("Business with id=" + businessId + " already has an employee with employeeId=" + employeeId);
    }
}
