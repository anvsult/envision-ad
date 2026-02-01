package com.envisionad.webservice.payment.presentationlayer;
import lombok.*;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private Instant timestamp;
    private String error;
    private String message;
    private String errorId;
}
