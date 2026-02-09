package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MediaLocationServiceImpl implements MediaLocationService {

    private final MediaLocationRepository mediaLocationRepository;
    private final com.envisionad.webservice.media.DataAccessLayer.MediaRepository mediaRepository;

    public MediaLocationServiceImpl(MediaLocationRepository mediaLocationRepository,
            com.envisionad.webservice.media.DataAccessLayer.MediaRepository mediaRepository) {
        this.mediaLocationRepository = mediaLocationRepository;
        this.mediaRepository = mediaRepository;
    }

    @Override
    public List<MediaLocation> getAllMediaLocationsByBusinessId(UUID businessId) {
        return mediaLocationRepository.findAllByBusinessId(businessId);
    }

    @Override
    public MediaLocation getMediaLocationById(UUID id) {
        return mediaLocationRepository.findById(id).orElse(null);
    }

    @Override
    public MediaLocation createMediaLocation(MediaLocation mediaLocation) {
        if (mediaLocation.getBusinessId() == null) {
            throw new IllegalArgumentException("Business ID is required to create a media location.");
        }
        return mediaLocationRepository.save(mediaLocation);
    }

    @Override
    public MediaLocation updateMediaLocation(MediaLocation mediaLocation) {
        return mediaLocationRepository.save(mediaLocation);
    }

    @Override
    public void deleteMediaLocation(UUID id) {
        // Unassign all media from this location before deleting
        MediaLocation location = mediaLocationRepository.findById(id).orElse(null);
        if (location != null && location.getMediaList() != null) {
            for (com.envisionad.webservice.media.DataAccessLayer.Media media : location.getMediaList()) {
                media.setMediaLocation(null);
                mediaRepository.save(media);
            }
        }
        mediaLocationRepository.deleteById(id);
    }

    @Override
    public void assignMediaToLocation(UUID locationId, UUID mediaId) {
        MediaLocation location = mediaLocationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));

        com.envisionad.webservice.media.DataAccessLayer.Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new IllegalArgumentException("Media not found"));

        media.setMediaLocation(location);
        mediaRepository.save(media);
    }

    @Override
    public void unassignMediaFromLocation(UUID locationId, UUID mediaId) {
        // Check if location exists
        if (!mediaLocationRepository.existsById(locationId)) {
            throw new IllegalArgumentException("Location not found");
        }

        com.envisionad.webservice.media.DataAccessLayer.Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new IllegalArgumentException("Media not found"));

        // Verify media is actually assigned to this location
        if (media.getMediaLocation() != null && media.getMediaLocation().getId().equals(locationId)) {
            media.setMediaLocation(null);
            mediaRepository.save(media);
        } else {
            throw new IllegalArgumentException("Media is not assigned to this location");
        }
    }
}
