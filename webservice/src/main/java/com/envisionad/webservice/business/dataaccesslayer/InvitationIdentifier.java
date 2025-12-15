package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Embeddable
@AllArgsConstructor
public class InvitationIdentifier {
    private String invitationId;

    public InvitationIdentifier() {
        this.invitationId = java.util.UUID.randomUUID().toString();
    }
}
