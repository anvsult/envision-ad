package com.envisionad.webservice.Media.BusinessLayer;

import com.envisionad.webservice.Media.DataAccessLayer.Media;
import java.util.List;

public interface MediaService {

    List<Media> getAllMedia();

    // Changed parameter from MediaIdentifier to Integer
    Media getMediaById(Integer id);

    Media addMedia(Media media);

    Media updateMedia(Media media);

    // Changed parameter from MediaIdentifier to Integer
    void deleteMedia(Integer id);
}