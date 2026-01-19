package com.envisionad.webservice.business.exceptions;

public class BadBusinessRequestException extends RuntimeException {
    public BadBusinessRequestException() {
        super("Bad Business Request");
    }
}
