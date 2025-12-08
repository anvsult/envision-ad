package com.envisionad.webservice.Media.BusinessLayer;

import com.envisionad.webservice.Media.DataAccessLayer.Media;
import java.util.List;
import java.math.BigDecimal;

public interface MediaService {

    List<Media> getAllMedia();

    List<Media> getAllFilteredActiveMedia(BigDecimal minPrice, BigDecimal maxPrice);

    Media getMediaById(String id);

    Media addMedia(Media media);

    Media updateMedia(Media media);

    void deleteMedia(String id);
}