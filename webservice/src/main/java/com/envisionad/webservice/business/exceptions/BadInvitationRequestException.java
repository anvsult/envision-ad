package com.envisionad.webservice.business.exceptions;

public class BadInvitationRequestException extends RuntimeException {
    public BadInvitationRequestException() {
        super("Bad Invitation Request");
    }
}
