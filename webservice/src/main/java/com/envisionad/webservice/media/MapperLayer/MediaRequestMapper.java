package com.envisionad.webservice.media.MapperLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocationRepository;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MediaRequestMapper {

    private final MediaLocationRepository mediaLocationRepo;

    public MediaRequestMapper(MediaLocationRepository mediaLocationRepo) {
        this.mediaLocationRepo = mediaLocationRepo;
    }

    public Media requestModelToEntity(MediaRequestModel request) {

        Media media = new Media();

        media.setMediaOwnerName(request.getMediaOwnerName());
        media.setTitle(request.getTitle());
        media.setResolution(request.getResolution());
        media.setTypeOfDisplay(request.getTypeOfDisplay());
        media.setAspectRatio(request.getAspectRatio());
        media.setLoopDuration(request.getLoopDuration());
        media.setSchedule(request.getSchedule());
        media.setStatus(request.getStatus());
        media.setWidth(request.getWidth());
        media.setHeight(request.getHeight());
        media.setPrice(request.getPrice());
        media.setDailyImpressions(request.getDailyImpressions());
        media.setImageUrl(request.getImageUrl());

        if (request.getBusinessId() != null) {
            media.setBusinessId(UUID.fromString(request.getBusinessId()));
        }

        if (request.getMediaLocationId() != null) {
            media.setMediaLocation(
                    mediaLocationRepo.findById(UUID.fromString(request.getMediaLocationId()))
                            .orElseThrow(() -> new IllegalArgumentException("Invalid mediaLocationId")));
        }

        return media;
    }
}