package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignResponseModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AdCampaignService {

    List<AdCampaignResponseModel> getAllAdCampaigns();

    AdResponseModel addAdToCampaign(String campaignId, AdRequestModel adRequestModel);

    AdResponseModel deleteAdFromCampaign(String campaignId, String adId);
}
