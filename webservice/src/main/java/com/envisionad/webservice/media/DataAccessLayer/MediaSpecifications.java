package com.envisionad.webservice.media.DataAccessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MediaSpecifications {

    public static Specification<Media> hasStatus(Status status) {
        return (root, query, cb) ->
            status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Media> titleContains(String title) {
        return (root, query, cb) -> {
            if (title == null || title.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    public static Specification<Media> priceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) {
                return null;
            }

            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("price"), minPrice, maxPrice);
            }

            if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            }

            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    public static Specification<Media> dailyImpressionsGreaterThan(Integer minDailyImpressions) {
        return (root, query, cb) ->
            minDailyImpressions == null ? null : cb.greaterThanOrEqualTo(root.get("dailyImpressions"), minDailyImpressions);
    }

    public static Specification<Media> locationContains(String locationName) {
        return (root, query, cb) -> {

            if (locationName == null || locationName.isBlank()) {
                return cb.conjunction();
            }

            Join<Media, MediaLocation> location =
                    root.join("mediaLocation", JoinType.LEFT);

            List<String> tokens = Arrays.stream(locationName.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(String::toLowerCase)
                    .toList();

            List<Predicate> tokenPredicates = new ArrayList<>();

            for (String token : tokens) {
                String like = "%" + token + "%";

                tokenPredicates.add(
                    cb.or(
                    cb.like(cb.lower(location.get("postalCode")), like),
                    cb.like(cb.lower(location.get("street")), like),
                    cb.like(cb.lower(location.get("city")), like),
                    cb.like(cb.lower(location.get("province")), like),
                    cb.like(cb.lower(location.get("country")), like)
                    )
                );
            }

            return cb.and(tokenPredicates.toArray(new Predicate[0]));
        };
    }





}
