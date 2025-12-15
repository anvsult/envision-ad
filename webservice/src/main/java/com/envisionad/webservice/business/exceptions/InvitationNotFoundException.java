package com.envisionad.webservice.business.exceptions;

public class InvitationNotFoundException extends RuntimeException {
    public InvitationNotFoundException() {
        super("Invitation Not Found");
    }
}
