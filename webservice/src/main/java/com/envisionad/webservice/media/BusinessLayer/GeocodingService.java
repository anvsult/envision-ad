package com.envisionad.webservice.media.BusinessLayer;

import java.util.Optional;

public interface GeocodingService {
    Optional<String> geocodeAddress(String address);
}
