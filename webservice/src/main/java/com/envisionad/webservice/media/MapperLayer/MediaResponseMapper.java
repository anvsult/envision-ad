package com.envisionad.webservice.media.MapperLayer;

import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationResponseModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MediaResponseMapper {
    private final BusinessRepository businessRepository;

    public MediaResponseMapper(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    public MediaResponseModel entityToResponseModel(Media media) {

        MediaResponseModel response = new MediaResponseModel();

        response.setId(media.getId());
        response.setTitle(media.getTitle());
        response.setMediaOwnerName(media.getMediaOwnerName());
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
        response.setPreviewConfiguration(media.getPreviewConfiguration());

        if (media.getBusinessId() != null) {

            response.setBusinessId(media.getBusinessId().toString());

            var business = businessRepository.findByBusinessId_BusinessId(media.getBusinessId().toString());

            if (business != null) {
                response.setBusinessName(business.getName());
            }
        }

        // Using Cloudinary URL
        if (media.getImageUrl() != null && !media.getImageUrl().isBlank()) {
            response.setImageUrl(media.getImageUrl());
        }

        if (media.getMediaLocation() != null) {
            MediaLocationResponseModel mediaLocationResponseModel = getMediaLocationResponseModel(media);

            response.setMediaLocation(mediaLocationResponseModel);
        }

        return response;
    }

    private static MediaLocationResponseModel getMediaLocationResponseModel(Media media) {
        MediaLocationResponseModel mediaLocationResponseModel = new MediaLocationResponseModel();
        mediaLocationResponseModel.setId(media.getMediaLocation().getId());
        mediaLocationResponseModel.setName(media.getMediaLocation().getName());
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
