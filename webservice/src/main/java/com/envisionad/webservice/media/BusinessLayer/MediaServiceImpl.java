package com.envisionad.webservice.media.BusinessLayer;

import com.cloudinary.Cloudinary;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.MediaSpecifications;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccount;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccountRepository;
import com.envisionad.webservice.payment.exceptions.StripeAccountNotOnboardedException;
import com.envisionad.webservice.utils.CloudinaryConfig;
import com.envisionad.webservice.utils.MathFunctions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.math.BigDecimal;

import java.util.*;

@Service
@Slf4j
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final StripeAccountRepository stripeAccountRepository;
    private final Cloudinary cloudinary;

    public MediaServiceImpl(MediaRepository mediaRepository, StripeAccountRepository stripeAccountRepository, Cloudinary cloudinary) {
        this.mediaRepository = mediaRepository;
        this.stripeAccountRepository = stripeAccountRepository;
        this.cloudinary = cloudinary;
    }

    @Override
    public List<Media> getAllMedia() {
        return mediaRepository.findAll();
    }

    @Override
    public Page<Media> getAllFilteredActiveMedia(
            Pageable pageable,
            String title,
            String businessId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDailyImpressions,
            String specialSort,
            Double userLat,
            Double userLng,
            List<Double> bounds,
            String excludedId
    ) {

        // FILTERING
        Specification<Media> spec = MediaSpecifications.hasStatus(Status.ACTIVE);

        if (title != null) {
            spec = spec.and(MediaSpecifications.titleContains(title));
        }

        if (businessId != null) {
            spec = spec.and(MediaSpecifications.businessIdEquals(UUID.fromString(businessId)));
        }

        if (minPrice != null || maxPrice != null) {
            spec = spec.and(MediaSpecifications.priceBetween(minPrice, maxPrice));
        }

        if (minDailyImpressions != null) {
            spec = spec.and(MediaSpecifications.dailyImpressionsGreaterThan(minDailyImpressions));
        }

        if (excludedId != null) {
            spec = spec.and(MediaSpecifications.mediaIdIsNotEqual(UUID.fromString(excludedId)));
        }

        if (bounds != null) {
            spec = spec.and(MediaSpecifications.withinBounds(bounds));
        }

        // Sort by Nearest
        if ("nearest".equals(specialSort) && userLat != null && userLng != null) {
            List<Media> list = mediaRepository.findAll(spec);

            list.sort(Comparator.comparingDouble(
                    m -> {
                        if (m.getMediaLocation() == null) {
                            return Double.POSITIVE_INFINITY;
                        }
                        return MathFunctions.distance(
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
        // Check if the business has a fully onboarded Stripe account
        UUID businessId = media.getBusinessId();
        if (businessId == null) {
            throw new IllegalArgumentException("Business ID is required to create media.");
        }

        Optional<StripeAccount> stripeAccountOpt = stripeAccountRepository.findByBusinessId(businessId.toString());

        if (stripeAccountOpt.isEmpty() || !stripeAccountOpt.get().isOnboardingComplete() || !stripeAccountOpt.get().isChargesEnabled() || !stripeAccountOpt.get().isPayoutsEnabled()) {
            throw new StripeAccountNotOnboardedException("Your business must have a fully configured Stripe account to create media. Please complete your Stripe onboarding.");
        }

        return mediaRepository.save(media);
    }

    @Override
    public Media updateMedia(Media media) {
        Media existingMedia = mediaRepository.findById(media.getId())
                .orElseThrow(() -> new RuntimeException("Media not found with id: " + media.getId()));

        String oldUrl = existingMedia.getImageUrl();
        String newUrl = media.getImageUrl();

        // Delete old image if the URL changed
        if (newUrl != null && !newUrl.equals(oldUrl)) {
            String oldPublicId = CloudinaryConfig.getPublicIdFromUrl(oldUrl);
            String oldResourceType = CloudinaryConfig.getResourceTypeFromUrl(oldUrl);

            if (oldPublicId != null) {
                try {
                    log.info("Update: Deleting old {} asset: {}", oldResourceType, oldPublicId);
                    cloudinary.uploader().destroy(oldPublicId, Map.of(
                            "invalidate", true,
                            "resource_type", oldResourceType));
                } catch (Exception e) {
                    log.error("Failed to clean up old {} asset: {}", oldResourceType, e.getMessage());
                }
            }
        }
        return mediaRepository.save(media);
    }

    @Override
    public void deleteMedia(UUID id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        String publicId = CloudinaryConfig.getPublicIdFromUrl(media.getImageUrl());
        String resourceType = CloudinaryConfig.getResourceTypeFromUrl(media.getImageUrl());

        if (publicId != null) {
            try {
                cloudinary.uploader().destroy(publicId, Map.of(
                        "invalidate", true,
                        "resource_type", resourceType
                ));
                log.info("Successfully deleted {} asset: {}", resourceType, publicId);
            } catch (Exception e) {
                log.error("Cloudinary cleanup failed for {} {}: {}", resourceType, publicId, e.getMessage());
            }
        }
        mediaRepository.delete(media);
    }
}