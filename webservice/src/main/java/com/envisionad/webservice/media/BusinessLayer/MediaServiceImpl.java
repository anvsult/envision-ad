package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.MediaSpecifications;
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
            String title,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDailyImpressions) {

        Specification<Media> spec = MediaSpecifications.hasStatus(Status.ACTIVE);

        if (title != null) {
            spec = spec.and(MediaSpecifications.titleContains(title));
        }

        if (minPrice != null || maxPrice != null) {
            spec = spec.and(MediaSpecifications.priceBetween(minPrice, maxPrice));
        }

        if (minDailyImpressions != null) {
            spec = spec.and(MediaSpecifications.dailyImpressionsGreaterThan(minDailyImpressions));
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