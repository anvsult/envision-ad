package com.envisionad.webservice.advertisement.datamapperlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.Ad;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdModelMapper {
    public AdResponseModel entityToResponseModel(Ad ad) {
        AdResponseModel responseModel = new AdResponseModel();
        responseModel.setAdId(ad.getAdIdentifier().getAdId());
        responseModel.setName(ad.getName());
        responseModel.setAdUrl(ad.getAdUrl());
        responseModel.setAdDurationSeconds(ad.getAdDurationSeconds().getSeconds());
        responseModel.setAdType(ad.getAdType().toString());
        responseModel.setCampaignId(ad.getCampaign().getCampaignId().getCampaignId());
        return responseModel;
    }

    public List<AdResponseModel> toAdResponseModelList(List<Ad> ads) {
        return ads.stream()
                .map(this::entityToResponseModel)
                .toList();
    }
}
