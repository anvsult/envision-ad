package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;

import java.util.List;

public interface AdService {
    List<AdResponseModel> getAllAds();

}
