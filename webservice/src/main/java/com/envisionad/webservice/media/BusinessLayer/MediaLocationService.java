package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;

import java.util.List;
import java.util.UUID;

public interface MediaLocationService {
    List<MediaLocation> getAllMediaLocationsByBusinessId(UUID businessId);

    MediaLocation getMediaLocationById(UUID id);

    MediaLocation createMediaLocation(MediaLocation mediaLocation);

    MediaLocation updateMediaLocation(MediaLocation mediaLocation);

    void deleteMediaLocation(UUID id);

    void assignMediaToLocation(UUID locationId, UUID mediaId);
}
