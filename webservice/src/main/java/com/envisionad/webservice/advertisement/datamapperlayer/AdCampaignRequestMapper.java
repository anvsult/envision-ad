package com.envisionad.webservice.advertisement.datamapperlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AdCampaignRequestMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "campaignId", ignore = true)
    @Mapping(target = "ads", ignore = true)
    AdCampaign requestModelToEntity(AdCampaignRequestModel adCampaign);

}
