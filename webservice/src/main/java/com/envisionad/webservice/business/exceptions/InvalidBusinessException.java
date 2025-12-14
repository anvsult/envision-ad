package com.envisionad.webservice.business.exceptions;

public class InvalidBusinessException extends RuntimeException {
    public InvalidBusinessException() {
        super("Invalid Business Request");
    }
}
