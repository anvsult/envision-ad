package com.envisionad.webservice.utils;

import com.envisionad.webservice.utils.exceptions.BusinessNotFoundException;
import com.envisionad.webservice.utils.exceptions.DuplicateBusinessNameException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import static org.springframework.http.HttpStatus.*;

@RestControllerAdvice
public class GlobalControllerHandler {

    @ResponseStatus(NOT_FOUND)
    @ExceptionHandler(BusinessNotFoundException.class)
    public HttpErrorInfo handleBusinessNotFoundException(BusinessNotFoundException ex) {
        return createHttpErrorInfo(NOT_FOUND, ex);
    }

    @ResponseStatus(BAD_REQUEST)
    @ExceptionHandler(DuplicateBusinessNameException.class)
    public HttpErrorInfo handleIllegalArgumentException(DuplicateBusinessNameException ex) {
        return createHttpErrorInfo(BAD_REQUEST, ex);
    }

    private HttpErrorInfo createHttpErrorInfo(HttpStatus httpStatus, Exception ex) {
        final String message = ex.getMessage();

        return new HttpErrorInfo(httpStatus, message);
    }
}