package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.UUID;

public interface MediaLocationService {
    List<MediaLocation> getAllMediaLocations(Jwt jwt, String businessId);

    MediaLocation getMediaLocationById(UUID id);

    MediaLocation createMediaLocation(MediaLocation mediaLocation, Jwt jwt);

    MediaLocation updateMediaLocation(UUID id, MediaLocation mediaLocation);

    void deleteMediaLocation(UUID id);
}
