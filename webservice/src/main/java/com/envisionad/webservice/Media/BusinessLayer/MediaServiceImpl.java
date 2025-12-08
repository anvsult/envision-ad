package com.envisionad.webservice.Media.BusinessLayer;

import com.envisionad.webservice.Media.DataAccessLayer.Media;
import com.envisionad.webservice.Media.DataAccessLayer.Status;
import com.envisionad.webservice.Media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.Media.DataAccessLayer.MediaSpecifications;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

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
    public List<Media> getAllFilteredActiveMedia(
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        Specification<Media> spec = MediaSpecifications.hasStatus(Status.ACTIVE);

        if (minPrice != null || maxPrice != null) {
            spec = spec.and(MediaSpecifications.priceBetween(minPrice, maxPrice));
        }
        return mediaRepository.findAll(spec);
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