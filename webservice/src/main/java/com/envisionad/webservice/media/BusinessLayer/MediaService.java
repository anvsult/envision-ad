package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.math.BigDecimal;
import java.util.UUID;

public interface MediaService {

    List<Media> getAllMedia();

    Page<Media> getAllFilteredActiveMedia(
            Pageable pageable,
            String title,
            String businessId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDailyImpressions,
            String specialSort,
            Double userLat,
            Double userLng
    );

    Media getMediaById(UUID id);

    Media addMedia(Media media);

    Media updateMedia(Media media);

    void deleteMedia(UUID id);
}