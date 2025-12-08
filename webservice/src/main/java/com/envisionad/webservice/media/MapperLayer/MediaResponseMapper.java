package com.envisionad.webservice.media.MapperLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MediaResponseMapper {

    private static final Logger log = LoggerFactory.getLogger(MediaResponseMapper.class);

    public MediaResponseMapper() {
    }

    public MediaResponseModel entityToResponseModel(Media media) {
        MediaResponseModel responseModel = new MediaResponseModel();
        responseModel.setId(media.getId());
        responseModel.setMediaOwnerName(media.getMediaOwnerName());
        responseModel.setTitle(media.getTitle());
        responseModel.setResolution(media.getResolution());
        responseModel.setLoopDuration(media.getLoopDuration());
        responseModel.setTypeOfDisplay(media.getTypeOfDisplay());
        responseModel.setAspectRatio(media.getAspectRatio());
        responseModel.setAddress(media.getAddress());
        responseModel.setSchedule(media.getSchedule());

        responseModel.setStatus(media.getStatus());
        responseModel.setWidth(media.getWidth());
        responseModel.setHeight(media.getHeight());
        responseModel.setPrice(media.getPrice());
        responseModel.setDailyImpressions(media.getDailyImpressions());
        if (media.getImageData() != null && media.getId() != null) {
            responseModel.setImageUrl("/api/v1/medias/" + media.getId() + "/image");
        }
        return responseModel;
    }

    public List<MediaResponseModel> entityListToResponseModelList(List<Media> mediaList) {
        return mediaList.stream()
                .map(this::entityToResponseModel)
                .collect(Collectors.toList());
    }
}