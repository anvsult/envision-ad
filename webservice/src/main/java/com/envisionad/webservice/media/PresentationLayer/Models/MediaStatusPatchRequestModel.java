package com.envisionad.webservice.media.PresentationLayer.Models;

import com.envisionad.webservice.media.DataAccessLayer.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MediaStatusPatchRequestModel {
    @NotNull
    private Status status;
}
