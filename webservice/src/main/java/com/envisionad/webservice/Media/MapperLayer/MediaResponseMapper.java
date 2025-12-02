package com.envisionad.webservice.Media.MapperLayer;

import com.envisionad.webservice.Media.DataAccessLayer.Media;
import com.envisionad.webservice.Media.PresentationLayer.Models.MediaResponseModel;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MediaResponseMapper {

    public MediaResponseModel entityToResponseModel(Media media) {
        MediaResponseModel responseModel = new MediaResponseModel();
        responseModel.setId(media.getId());
        responseModel.setMediaOwnerName(media.getMediaOwnerName());
        responseModel.setTitle(media.getTitle());
        responseModel.setResolution(media.getResolution());
        responseModel.setTypeOfDisplay(media.getTypeOfDisplay());
        responseModel.setAspectRatio(media.getAspectRatio());
        responseModel.setAddress(media.getAddress());
        responseModel.setSchedule(media.getSchedule());
        responseModel.setStatus(media.getStatus());
        return responseModel;
    }

    public List<MediaResponseModel> entityListToResponseModelList(List<Media> mediaList) {
        return mediaList.stream()
                .map(this::entityToResponseModel)
                .collect(Collectors.toList());
    }
}