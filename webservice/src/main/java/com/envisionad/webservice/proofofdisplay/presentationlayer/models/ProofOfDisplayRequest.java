package com.envisionad.webservice.proofofdisplay.presentationlayer.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class ProofOfDisplayRequest {
    @NotBlank
    private String mediaId;
    @NotBlank
    private String campaignId;
    @NotEmpty
    private List<String> proofImageUrls;
}
