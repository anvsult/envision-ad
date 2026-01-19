package com.envisionad.webservice.proofofdisplay.presentationlayer.models;

import lombok.Data;
import java.util.List;

@Data
public class ProofOfDisplayRequest {
    private String mediaId;
    private String campaignId;
    private List<String> proofImageUrls;
}
