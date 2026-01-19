package com.envisionad.webservice.business.mappinglayer;

import com.envisionad.webservice.business.dataaccesslayer.Verification;
import com.envisionad.webservice.business.presentationlayer.models.VerificationResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VerificationMapper {
    @Mapping(target = "verificationId", source = "verificationId.verificationId")
    @Mapping(target = "businessId", source = "businessId.businessId")
    VerificationResponseModel toResponse(Verification verification);
}
