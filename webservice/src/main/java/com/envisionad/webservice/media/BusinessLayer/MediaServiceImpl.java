package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.MediaSpecifications;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

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
    public Page<Media> getAllFilteredActiveMedia(
            Pageable pageable,
            String title,
            String location,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDailyImpressions,
            String specialSort,
            Double userLat,
            Double userLng
            ) {

        // FILTERING
        Specification<Media> spec = MediaSpecifications.hasStatus(Status.ACTIVE);

        if (location != null) {
            spec = spec.and(MediaSpecifications.locationContains(location));
        }

        if (title != null) {
            spec = spec.and(MediaSpecifications.titleContains(title));
        }

        if (minPrice != null || maxPrice != null) {
            spec = spec.and(MediaSpecifications.priceBetween(minPrice, maxPrice));
        }

        if (minDailyImpressions != null) {
            spec = spec.and(MediaSpecifications.dailyImpressionsGreaterThan(minDailyImpressions));
        }

        // Sort by Nearest
        if ("nearest".equals(specialSort) && userLat != null && userLng != null) {
            List<Media> list = mediaRepository.findAll(spec);

            list.sort(Comparator.comparingDouble(
                    m -> {
                        if (m.getMediaLocation() == null) {
                            return Double.POSITIVE_INFINITY;
                        }
                        return distance(
                                userLat,
                                userLng,
                                m.getMediaLocation().getLatitude(),
                                m.getMediaLocation().getLongitude()
                        );
                    }
            ));

            int pageStart = (int) pageable.getOffset();
            int pageEnd = Math.min(pageStart + pageable.getPageSize(), list.size());

            if (pageStart >= list.size()) {
                return Page.empty(pageable);
            }
            List<Media> paged = list.subList(pageStart, pageEnd);

            return new PageImpl<>(paged, pageable, list.size());
        }

        return mediaRepository.findAll(spec, pageable);
    }

    @Override
    public Media getMediaById(UUID id) {
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
    public void deleteMedia(UUID id) {
        mediaRepository.deleteById(id);
    }

    // Calculating distance using the Haversine Formula
    private double distance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // the earth's radius
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        lat1 = Math.toRadians(lat1);
        lat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

}