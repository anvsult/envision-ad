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
import java.util.UUID;

public class MediaSpecifications {

    public static Specification<Media> hasStatus(Status status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
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
        return (root, query, cb) -> minDailyImpressions == null ? null
                : cb.greaterThanOrEqualTo(root.get("dailyImpressions"), minDailyImpressions);
    }

    public static Specification<Media> businessIdEquals(UUID businessId) {
        return (root, query, cb) -> businessId == null ? null
                : cb.equal(root.get("businessId"), businessId);
    }

    public static Specification<Media> mediaIdIsNotEqual(UUID excludedId) {
        return (root, query, cb) -> excludedId == null ? null
                : cb.notEqual(root.get("id"), excludedId);
    }

    public static Specification<Media> withinBounds(List<Double> bounds) {
        return (root, query, cb) -> {
            if (bounds == null || bounds.size() != 4) {
                return null;
            }

            double minLat = Math.min(bounds.get(0), bounds.get(1));
            double maxLat = Math.max(bounds.get(0), bounds.get(1));
            double minLng = Math.min(bounds.get(2), bounds.get(3));
            double maxLng = Math.max(bounds.get(2), bounds.get(3));

            Join<Media, MediaLocation> location = root.join("mediaLocation", JoinType.INNER);

            Predicate latPredicate =
                cb.between(location.get("latitude"), minLat, maxLat);

            Predicate lngPredicate =
                cb.between(location.get("longitude"), minLng, maxLng);

            return cb.and(latPredicate, lngPredicate);
        };
    }


    // public static Specification<Media> locationContains(String locationName) {
    // return (root, query, cb) -> {
    //
    // if (locationName == null || locationName.isBlank()) {
    // return cb.conjunction();
    // }
    //
    // Join<Media, MediaLocation> location =
    // root.join("mediaLocation", JoinType.LEFT);
    //
    // List<String> tokens = Arrays.stream(locationName.split(","))
    // .map(String::trim)
    // .filter(s -> !s.isEmpty())
    // .map(String::toLowerCase)
    // .toList();
    //
    // List<Predicate> tokenPredicates = new ArrayList<>();
    //
    // for (String token : tokens) {
    // String like = "%" + token + "%";
    //
    // tokenPredicates.add(
    // cb.or(
    // cb.like(cb.lower(location.get("postalCode")), like),
    // cb.like(cb.lower(location.get("street")), like),
    // cb.like(cb.lower(location.get("city")), like),
    // cb.like(cb.lower(location.get("province")), like),
    // cb.like(cb.lower(location.get("country")), like)
    // )
    // );
    // }
    //
    // return cb.and(tokenPredicates.toArray(new Predicate[0]));
    // };
    // }

}
