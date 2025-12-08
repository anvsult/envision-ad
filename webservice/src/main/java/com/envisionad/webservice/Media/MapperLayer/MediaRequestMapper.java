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

    private static final Logger log = LoggerFactory.getLogger(MediaRequestMapper.class);

    public MediaRequestMapper() {
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
        media.setSchedule(requestModel.getSchedule());
        media.setStatus(requestModel.getStatus());
        media.setWidth(requestModel.getWidth());
        media.setHeight(requestModel.getHeight());
        media.setPrice(requestModel.getPrice());
        media.setDailyImpressions(requestModel.getDailyImpressions());
        return media;
    }
}