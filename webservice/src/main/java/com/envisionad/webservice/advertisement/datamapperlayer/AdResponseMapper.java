package com.envisionad.webservice.advertisement.datamapperlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.Ad;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AdResponseMapper {

    @Mapping(target = "adId", source = "adIdentifier.adIdentifier")
    @Mapping(target = "campaignId", source = "campaign.campaignId.campaignId")
    @Mapping(target = "adDurationSeconds", source = "adDurationSeconds.seconds")
    AdResponseModel entityToResponseModel(Ad ad);

    List<AdResponseModel> entitiesToResponseModelList(List<Ad> ads);
}