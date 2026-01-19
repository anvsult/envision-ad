package com.envisionad.webservice.business.presentationlayer.models;

import com.envisionad.webservice.business.dataaccesslayer.VerificationStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class VerificationResponseModel {
    private String verificationId;
    private String businessId;
    private VerificationStatus status;
    private String comments;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
