package com.envisionad.webservice.business.presentationlayer.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class InvitationResponseModel {
    private String invitationId;
    private String email;
    private LocalDateTime timeExpires;
}
