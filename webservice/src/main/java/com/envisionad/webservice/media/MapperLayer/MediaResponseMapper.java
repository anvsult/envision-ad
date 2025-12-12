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
        response.setSchedule(media.getSchedule());
        response.setStatus(media.getStatus());
        response.setWidth(media.getWidth());
        response.setHeight(media.getHeight());
        response.setPrice(media.getPrice());
        response.setDailyImpressions(media.getDailyImpressions());

        if (media.getImageData() != null) {
            response.setImageUrl("/api/v1/media/" + media.getId() + "/image");
        }

        if (media.getMediaLocation() != null) {
            MediaResponseModel.MediaLocationResponseModel mediaLocationResponseModel = getMediaLocationResponseModel(media);

            response.setMediaLocation(mediaLocationResponseModel);
        }

        return response;
    }

    private static MediaResponseModel.MediaLocationResponseModel getMediaLocationResponseModel(Media media) {
        MediaResponseModel.MediaLocationResponseModel mediaLocationResponseModel = new MediaResponseModel.MediaLocationResponseModel();
        mediaLocationResponseModel.setId(String.valueOf(media.getMediaLocation().getId()));
        mediaLocationResponseModel.setName(media.getMediaLocation().getName());
        mediaLocationResponseModel.setDescription(media.getMediaLocation().getDescription());
        mediaLocationResponseModel.setCountry(media.getMediaLocation().getCountry());
        mediaLocationResponseModel.setProvince(media.getMediaLocation().getProvince());
        mediaLocationResponseModel.setCity(media.getMediaLocation().getCity());
        mediaLocationResponseModel.setStreet(media.getMediaLocation().getStreet());
        mediaLocationResponseModel.setPostalCode(media.getMediaLocation().getPostalCode());
        mediaLocationResponseModel.setLatitude(media.getMediaLocation().getLatitude());
        mediaLocationResponseModel.setLongitude(media.getMediaLocation().getLongitude());
        return mediaLocationResponseModel;
    }

    public List<MediaResponseModel> entityListToResponseModelList(List<Media> list) {
        return list.stream()
                .map(this::entityToResponseModel)
                .toList();
    }
}
