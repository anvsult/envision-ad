package com.envisionad.webservice.advertisement.datamapperlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {AdResponseMapper.class})
public interface AdCampaignResponseMapper {

    @Mapping(target = "campaignId", source = "campaignId.campaignId")
    AdCampaignResponseModel entityToResponseModel(AdCampaign adCampaign);

    List<AdCampaignResponseModel> entitiesToResponseModelList(List<AdCampaign> adCampaigns);
}
