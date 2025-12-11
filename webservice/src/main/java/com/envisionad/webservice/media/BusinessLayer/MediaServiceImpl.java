package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.MediaSpecifications;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
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
    public List<Media> getAllFilteredActiveMedia(
            String title,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDailyImpressions,
            String sortBy,
            Double userLat,
            Double userLng
            ) {
        // FILTERING
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

        // SORTING
        List<Media> filtered = mediaRepository.findAll(spec);

        // Sort by Nearest
        if ("nearest".equals(sortBy) && userLat != null && userLng != null) {
            filtered.sort(Comparator.comparingDouble(
                    m -> distance(
                            userLat,
                            userLng,
                            m.getMediaLocation().getLatitude(),
                            m.getMediaLocation().getLongitude()
                    )
            ));
            return filtered;
        }

        // Otherwise sort with comparator
        filtered.sort(buildComparator(sortBy));
        return filtered;
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


    // Sorting Comparators
    private Comparator<Media> buildComparator(String sortBy) {
        if (sortBy == null) return (a, b) -> 0;

        return switch (sortBy) {
            case "price_asc" -> Comparator.comparing(Media::getPrice);
            case "price_desc" -> Comparator.comparing(Media::getPrice).reversed();
            case "title_asc" -> Comparator.comparing(Media::getTitle);
            case "title_desc" -> Comparator.comparing(Media::getTitle).reversed();
            case "impressions_asc" -> Comparator.comparing(Media::getDailyImpressions);
            case "impressions_desc" -> Comparator.comparing(Media::getDailyImpressions).reversed();
            default -> (a, b) -> 0;
        };
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