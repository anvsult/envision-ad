package com.envisionad.webservice.Media.BusinessLayer;

import com.envisionad.webservice.Media.DataAccessLayer.Media;
import java.util.List;

public interface MediaService {

    List<Media> getAllMedia();

    Media getMediaById(String id);

    Media addMedia(Media media);

    Media updateMedia(Media media);

    void deleteMedia(String id);
}