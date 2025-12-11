package com.envisionad.webservice.media.MapperLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MediaResponseMapper {

    public MediaResponseModel entityToResponseModel(Media media) {

        MediaResponseModel response = new MediaResponseModel();

        response.setId(media.getId());
        response.setMediaOwnerName(media.getMediaOwnerName());
        response.setTitle(media.getTitle());
        response.setResolution(media.getResolution());
        response.setLoopDuration(media.getLoopDuration());
        response.setTypeOfDisplay(media.getTypeOfDisplay());
        response.setAspectRatio(media.getAspectRatio());

        response.setMediaLocationId(
                media.getMediaLocation() != null ? media.getMediaLocation().getId() : null
        );

        response.setSchedule(media.getSchedule());
        response.setStatus(media.getStatus());
        response.setWidth(media.getWidth());
        response.setHeight(media.getHeight());
        response.setPrice(media.getPrice());
        response.setDailyImpressions(media.getDailyImpressions());

        if (media.getImageData() != null) {
            response.setImageUrl("/api/v1/medias/" + media.getId() + "/image");
        }

        return response;
    }

    public List<MediaResponseModel> entityListToResponseModelList(List<Media> list) {
        return list.stream()
                .map(this::entityToResponseModel)
                .toList();
    }
}
