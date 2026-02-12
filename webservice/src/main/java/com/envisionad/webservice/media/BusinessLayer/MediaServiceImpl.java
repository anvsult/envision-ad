package com.envisionad.webservice.media.BusinessLayer;

import com.cloudinary.Cloudinary;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.exceptions.BusinessNotFoundException;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.MediaSpecifications;
import com.envisionad.webservice.media.MapperLayer.MediaResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccount;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccountRepository;
import com.envisionad.webservice.payment.exceptions.StripeAccountNotOnboardedException;
import com.envisionad.webservice.utils.CloudinaryConfig;
import com.envisionad.webservice.utils.JwtUtils;
import com.envisionad.webservice.utils.MathFunctions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.oauth2.jwt.Jwt;
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
    private final MediaResponseMapper mediaResponseMapper;
    private final BusinessRepository businessRepository;
    private final JwtUtils jwtUtils;

    public MediaServiceImpl(MediaRepository mediaRepository, StripeAccountRepository stripeAccountRepository, Cloudinary cloudinary, MediaResponseMapper mediaResponseMapper, BusinessRepository businessRepository, JwtUtils jwtUtils) {
        this.mediaRepository = mediaRepository;
        this.stripeAccountRepository = stripeAccountRepository;
        this.cloudinary = cloudinary;
        this.mediaResponseMapper = mediaResponseMapper;
        this.businessRepository = businessRepository;
        this.jwtUtils = jwtUtils;
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
    public List<MediaResponseModel> getMediaByBusinessId(Jwt jwt, String businessId) {
        UUID businessUuid;
        try {
            businessUuid = UUID.fromString(businessId);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid businessId format: " + businessId, ex);
        }

        Business existingBusiness = businessRepository.findByBusinessId_BusinessId(businessId);
        if (existingBusiness == null) {
            throw new BusinessNotFoundException(businessId);
        }

        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, businessId);

        List<Media> mediaList = mediaRepository.findMediaByBusinessId(businessUuid);

        return mediaList.stream().map(mediaResponseMapper::entityToResponseModel).toList();
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
                .orElseThrow(() -> new MediaNotFoundException(media.getId().toString()));

        String oldUrl = existingMedia.getImageUrl();
        String newUrl = media.getImageUrl();

        String normalizedOldUrl = (oldUrl != null && !oldUrl.trim().isEmpty()) ? oldUrl.trim() : null;
        String normalizedNewUrl = (newUrl != null && !newUrl.trim().isEmpty()) ? newUrl.trim() : null;

        if (normalizedOldUrl != null && !Objects.equals(normalizedNewUrl, normalizedOldUrl)) {
            String oldPublicId = CloudinaryConfig.getPublicIdFromUrl(normalizedOldUrl);
            String oldResourceType = CloudinaryConfig.getResourceTypeFromUrl(normalizedOldUrl);

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
        media.setImageUrl(normalizedNewUrl);
        return mediaRepository.save(media);
    }

    @Override
    public void deleteMedia(UUID id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new MediaNotFoundException(id.toString()));

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
