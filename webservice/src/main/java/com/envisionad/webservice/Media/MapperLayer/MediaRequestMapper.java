package com.envisionad.webservice.Media.MapperLayer;

import com.envisionad.webservice.Media.DataAccessLayer.Media;
import com.envisionad.webservice.Media.PresentationLayer.Models.MediaRequestModel;
import org.springframework.stereotype.Component;

@Component
public class MediaRequestMapper {

    public Media requestModelToEntity(MediaRequestModel requestModel) {
        Media media = new Media();
        media.setMediaOwnerName(requestModel.getMediaOwnerName());
        media.setTitle(requestModel.getTitle());
        media.setResolution(requestModel.getResolution());
        media.setTypeOfDisplay(requestModel.getTypeOfDisplay());
        media.setAspectRatio(requestModel.getAspectRatio());
        media.setAddress(requestModel.getAddress());
        media.setSchedule(requestModel.getSchedule());
        media.setStatus(requestModel.getStatus());
        return media;
    }
}