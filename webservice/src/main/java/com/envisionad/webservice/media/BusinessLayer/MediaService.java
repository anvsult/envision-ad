package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import java.util.List;
import java.math.BigDecimal;

public interface MediaService {

    List<Media> getAllMedia();

    List<Media> getAllFilteredActiveMedia(String title, BigDecimal minPrice, BigDecimal maxPrice,
            Integer minDailyImpressions);

    Media getMediaById(String id);

    Media addMedia(Media media);

    Media updateMedia(Media media);

    void deleteMedia(String id);
}