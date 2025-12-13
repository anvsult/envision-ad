package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import java.util.List;
import java.math.BigDecimal;
import java.util.UUID;

public interface MediaService {

    List<Media> getAllMedia();

    List<Media> getAllFilteredActiveMedia(
            String title,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDailyImpressions,
            String sortBy,
            Double userLat,
            Double userLng
    );

    Media getMediaById(UUID id);

    Media addMedia(Media media);

    Media updateMedia(Media media);

    void deleteMedia(UUID id);
}