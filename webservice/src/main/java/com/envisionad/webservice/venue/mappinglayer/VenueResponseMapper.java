package com.envisionad.webservice.venue.mappinglayer;

import com.envisionad.webservice.venue.dataaccesslayer.Venue;
import com.envisionad.webservice.venue.presentationlayer.models.VenueResponseModel;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VenueResponseMapper {

    public VenueResponseModel entityToResponseModel(Venue venue, long mediaCount) {
        VenueResponseModel response = new VenueResponseModel();
        response.setVenueId(venue.getVenueId());
        response.setNameEn(venue.getNameEn());
        response.setNameFr(venue.getNameFr());
        response.setColorCode(venue.getColorCode());
        response.setMediaCount(mediaCount);
        return response;
    }

    public List<VenueResponseModel> entityListToResponseModelList(List<Venue> venues, java.util.function.Function<String, Long> mediaCountFn) {
        return venues.stream()
                .map(v -> entityToResponseModel(v, mediaCountFn.apply(v.getVenueId())))
                .toList();
    }
}
