package com.envisionad.webservice.venue.businesslogiclayer;

import com.envisionad.webservice.venue.dataaccesslayer.Venue;
import com.envisionad.webservice.venue.presentationlayer.models.VenueRequestModel;

import java.util.List;

public interface VenueService {

    List<Venue> getAllVenues(String locale);

    Venue getVenueByVenueId(String venueId);

    Venue createVenue(Venue venue);

    Venue updateVenue(String venueId, VenueRequestModel request);

    void deleteVenue(String venueId);

    long getMediaCountForVenue(String venueId);
}
