package com.envisionad.webservice.business.mappinglayer;

import com.envisionad.webservice.business.dataaccesslayer.Invitation;
import com.envisionad.webservice.business.presentationlayer.models.InvitationRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.InvitationResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InvitationMapper {
    Invitation toEntity(InvitationRequestModel entity);

    @Mapping(target = "invitationId", expression = "java(invitation.getInvitationId().getInvitationId())")
    InvitationResponseModel toResponse(Invitation invitation);
}
