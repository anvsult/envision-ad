package com.envisionad.webservice.venue.mappinglayer;

import com.envisionad.webservice.venue.dataaccesslayer.Venue;
import com.envisionad.webservice.venue.presentationlayer.models.VenueRequestModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VenueRequestMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "venueId", ignore = true)
    Venue requestModelToEntity(VenueRequestModel request);
}
