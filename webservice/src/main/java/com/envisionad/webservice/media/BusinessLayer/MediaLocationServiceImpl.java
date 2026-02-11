package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocationRepository;
import org.springframework.stereotype.Service;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class MediaLocationServiceImpl implements MediaLocationService {

    private final MediaLocationRepository mediaLocationRepository;
    private final MediaRepository mediaRepository;
    private final BusinessService businessService;

    public MediaLocationServiceImpl(MediaLocationRepository mediaLocationRepository,
            MediaRepository mediaRepository,
            BusinessService businessService) {
        this.mediaLocationRepository = mediaLocationRepository;
        this.mediaRepository = mediaRepository;
        this.businessService = businessService;
    }

    @Override
    public List<MediaLocation> getAllMediaLocations(Jwt jwt, String businessId) {
        String targetBusinessId = businessId;

        // If businessId is not provided, try to infer from JWT
        if (targetBusinessId == null && jwt != null) {
            try {
                BusinessResponseModel business = businessService.getBusinessByUserId(jwt, jwt.getSubject());
                if (business != null) {
                    targetBusinessId = business.getBusinessId();
                }
            } catch (Exception e) {
                log.error("Error fetching business for user {}: {}", jwt.getSubject(), e.getMessage());
            }
        }

        if (targetBusinessId == null) {
            throw new IllegalArgumentException("Business ID is required");
        }

        return mediaLocationRepository.findAllByBusinessId(UUID.fromString(targetBusinessId));
    }

    @Override
    public MediaLocation getMediaLocationById(UUID id) {
        return mediaLocationRepository.findById(id).orElse(null);
    }

    @Override
    public MediaLocation createMediaLocation(MediaLocation mediaLocation, Jwt jwt) {
        if (jwt != null) {
            try {
                BusinessResponseModel business = businessService.getBusinessByUserId(jwt, jwt.getSubject());
                if (business != null && business.getBusinessId() != null) {
                    mediaLocation.setBusinessId(UUID.fromString(business.getBusinessId()));
                }
            } catch (Exception e) {
                log.error("Error fetching business for user {}: {}", jwt.getSubject(), e.getMessage(), e);
            }
        }

        if (mediaLocation.getBusinessId() == null) {
            throw new IllegalArgumentException("Business ID is required to create a media location.");
        }
        return mediaLocationRepository.save(mediaLocation);
    }

    @Override
    public MediaLocation updateMediaLocation(UUID id, MediaLocation mediaLocation) {
        MediaLocation existing = mediaLocationRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }

        mediaLocation.setId(id);
        mediaLocation.setBusinessId(existing.getBusinessId());

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
}
