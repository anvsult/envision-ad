package com.envisionad.webservice.proofofdisplay.presentationlayer.models;

import lombok.Data;
import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

@Data
public class ProofOfDisplayRequest {
    @NotBlank
    private String mediaId;
    @NotBlank
    private String campaignId;
    @NotEmpty
    private List<String> proofImageUrls;
}
