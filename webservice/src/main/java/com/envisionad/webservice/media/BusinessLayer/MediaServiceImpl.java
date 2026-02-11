package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.MediaSpecifications;
import com.envisionad.webservice.media.MapperLayer.MediaResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccount;
import com.envisionad.webservice.payment.dataaccesslayer.StripeAccountRepository;
import com.envisionad.webservice.payment.exceptions.StripeAccountNotOnboardedException;
import com.envisionad.webservice.utils.JwtUtils;
import com.envisionad.webservice.utils.MathFunctions;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final StripeAccountRepository stripeAccountRepository;
    private final MediaResponseMapper mediaResponseMapper;
    private final JwtUtils jwtUtils;

    public MediaServiceImpl(MediaRepository mediaRepository, StripeAccountRepository stripeAccountRepository, MediaResponseMapper mediaResponseMapper, JwtUtils jwtUtils) {
        this.mediaRepository = mediaRepository;
        this.stripeAccountRepository = stripeAccountRepository;
        this.mediaResponseMapper = mediaResponseMapper;
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
    public MediaResponseModel updateMediaById(Jwt jwt, String id, MediaRequestModel requestModel) {
        Media existingMedia = mediaRepository.findById(UUID.fromString(id)).orElse(null);
        if (existingMedia == null) {
            throw new IllegalArgumentException("Media with the specified ID does not exist.");
        }

        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, existingMedia.getBusinessId().toString());

        // Validate the request model
        MediaRequestValidator.validateMediaRequest(requestModel);

        // Update fields
        existingMedia.setTitle(requestModel.getTitle());
        existingMedia.setPrice(requestModel.getPrice());
        existingMedia.setDailyImpressions(requestModel.getDailyImpressions());
        existingMedia.setTypeOfDisplay(requestModel.getTypeOfDisplay());
        existingMedia.setSchedule(requestModel.getSchedule());
        existingMedia.setImageUrl(requestModel.getImageUrl());
        existingMedia.setPreviewConfiguration(requestModel.getPreviewConfiguration());

        // Set status to pending after update
        existingMedia.setStatus(Status.PENDING);

        Media updatedMedia = mediaRepository.save(existingMedia);
        return mediaResponseMapper.entityToResponseModel(updatedMedia);
    }

    @Override
    public void deleteMedia(UUID id) {
        mediaRepository.deleteById(id);
    }

    // Calculating distance using the Haversine Formula


}