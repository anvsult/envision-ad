package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;

    public MediaServiceImpl(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    @Override
    public List<Media> getAllMedia() {
        return mediaRepository.findAll();
    }

    @Override
    public List<Media> getAllActiveMedia() {
        return mediaRepository.findAllByStatus(Status.ACTIVE);
    }

    @Override
    public Media getMediaById(String id) {
        return mediaRepository.findById(id).orElse(null);
    }

    @Override
    public Media addMedia(Media media) {
        return mediaRepository.save(media);
    }

    @Override
    public Media updateMedia(Media media) {
        return mediaRepository.save(media);
    }

    @Override
    public void deleteMedia(String id) {
        mediaRepository.deleteById(id);
    }
}