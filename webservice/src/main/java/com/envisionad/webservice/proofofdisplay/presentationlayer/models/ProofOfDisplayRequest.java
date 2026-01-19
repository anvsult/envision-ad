package com.envisionad.webservice.proofofdisplay.presentationlayer.models;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProofOfDisplayRequest {

    private String mediaId;
    private String mediaName;
    private String campaignId;
    private String campaignName;
    private String advertiserEmail;
    private List<String> proofImageUrls;
}
