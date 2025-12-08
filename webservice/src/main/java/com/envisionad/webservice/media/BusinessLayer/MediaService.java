package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import java.util.List;

public interface MediaService {

    List<Media> getAllMedia();

    List<Media> getAllActiveMedia();

    Media getMediaById(String id);

    Media addMedia(Media media);

    Media updateMedia(Media media);

    void deleteMedia(String id);
}