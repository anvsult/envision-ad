package com.envisionad.webservice.Media.MapperLayer;

import com.envisionad.webservice.Media.DataAccessLayer.Media;
import com.envisionad.webservice.Media.PresentationLayer.Models.MediaResponseModel;
import com.envisionad.webservice.Media.PresentationLayer.Models.ScheduleModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MediaResponseMapper {

    private final ObjectMapper objectMapper;
    private static final Logger log = LoggerFactory.getLogger(MediaResponseMapper.class);

    public MediaResponseMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
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
        // parse schedule JSON string from entity into ScheduleModel
        String scheduleJson = media.getSchedule();
        if (scheduleJson != null) {
            try {
                ScheduleModel schedule = objectMapper.readValue(scheduleJson, ScheduleModel.class);
                responseModel.setSchedule(schedule);
            } catch (Exception e) {
                log.error("Failed to parse schedule JSON for media id={}", media.getId(), e);
                responseModel.setSchedule(null);
            }
        } else {
            responseModel.setSchedule(null);
        }

        responseModel.setStatus(media.getStatus());
        responseModel.setWidth(media.getWidth());
        responseModel.setHeight(media.getHeight());
        responseModel.setPrice(media.getPrice());
        responseModel.setDailyImpressions(media.getDailyImpressions());
        if (media.getImageData() != null && media.getId() != null) {
            responseModel.setImageUrl("/api/v1/media/" + media.getId() + "/image");
        }
        return responseModel;
    }

    public List<MediaResponseModel> entityListToResponseModelList(List<Media> mediaList) {
        return mediaList.stream()
                .map(this::entityToResponseModel)
                .collect(Collectors.toList());
    }
}