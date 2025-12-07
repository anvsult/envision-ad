package com.envisionad.webservice.Media.MapperLayer;

import com.envisionad.webservice.Media.DataAccessLayer.Media;
import com.envisionad.webservice.Media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.Media.PresentationLayer.Models.ScheduleModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class MediaRequestMapper {

    private final ObjectMapper objectMapper;
    private static final Logger log = LoggerFactory.getLogger(MediaRequestMapper.class);

    public MediaRequestMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Media requestModelToEntity(MediaRequestModel requestModel) {
        Media media = new Media();
        media.setMediaOwnerName(requestModel.getMediaOwnerName());
        media.setTitle(requestModel.getTitle());
        media.setResolution(requestModel.getResolution());
        media.setTypeOfDisplay(requestModel.getTypeOfDisplay());
        media.setAspectRatio(requestModel.getAspectRatio());
        media.setLoopDuration(requestModel.getLoopDuration());
        media.setAddress(requestModel.getAddress());
        ScheduleModel schedule = requestModel.getSchedule();
        if (schedule != null) {
            try {
                String json = objectMapper.writeValueAsString(schedule);
                media.setSchedule(json);
            } catch (Exception e) {
                log.error("Failed to serialize ScheduleModel for media title={}", requestModel.getTitle(), e);
                media.setSchedule(null);
            }
        } else {
            media.setSchedule(null);
        }
        media.setStatus(requestModel.getStatus());
        media.setWidth(requestModel.getWidth());
        media.setHeight(requestModel.getHeight());
        media.setPrice(requestModel.getPrice());
        return media;
    }
}