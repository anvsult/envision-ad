package com.envisionad.webservice.advertisement.datamapperlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.Ad;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdRequestModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AdRequestMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "adIdentifier", ignore = true)
    @Mapping(target = "campaign", ignore = true)

    @Mapping(target = "adType", ignore = true)
    @Mapping(target = "adDurationSeconds", ignore = true)

    Ad requestModelToEntity(AdRequestModel adRequestModel);

}
