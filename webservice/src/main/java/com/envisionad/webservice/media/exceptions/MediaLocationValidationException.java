package com.envisionad.webservice.media.exceptions;

import java.util.Map;

public class MediaLocationValidationException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public MediaLocationValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors;
    }

    public MediaLocationValidationException(String message, Map<String, String> fieldErrors, Throwable cause) {
        super(message, cause);
        this.fieldErrors = fieldErrors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
