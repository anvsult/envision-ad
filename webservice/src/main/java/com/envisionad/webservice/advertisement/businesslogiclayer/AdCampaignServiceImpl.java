package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.cloudinary.Cloudinary;
import com.envisionad.webservice.advertisement.dataaccesslayer.*;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignResponseMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdResponseMapper;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.advertisement.exceptions.AdNotFoundException;
import com.envisionad.webservice.advertisement.exceptions.InvalidAdTypeException;
import com.envisionad.webservice.advertisement.exceptions.InvalidAdDurationException;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignResponseModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.exceptions.BusinessNotFoundException;
import com.envisionad.webservice.utils.CloudinaryConfig;
import com.envisionad.webservice.utils.JwtUtils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Map;

import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;

@Slf4j
@Service
public class AdCampaignServiceImpl implements AdCampaignService {
    private final BusinessRepository businessRepository;
    private final AdCampaignRepository adCampaignRepository;
    private final AdCampaignRequestMapper adCampaignRequestMapper;
    private final AdCampaignResponseMapper adCampaignResponseMapper;
    private final AdRequestMapper adRequestMapper;
    private final AdResponseMapper adResponseMapper;
    private final JwtUtils jwtUtils;
    private final ReservationRepository reservationRepository;
    private final Cloudinary cloudinary;

    public AdCampaignServiceImpl(AdCampaignRepository adCampaignRepository, AdCampaignRequestMapper adCampaignRequestMapper, AdCampaignResponseMapper adCampaignResponseMapper, AdRequestMapper adRequestMapper, AdResponseMapper adResponseMapper, BusinessRepository businessRepository, JwtUtils jwtUtils, ReservationRepository reservationRepository, Cloudinary cloudinary) {
        this.businessRepository = businessRepository;
        this.adCampaignRepository = adCampaignRepository;
        this.adCampaignRequestMapper = adCampaignRequestMapper;
        this.adCampaignResponseMapper = adCampaignResponseMapper;
        this.adRequestMapper = adRequestMapper;
        this.adResponseMapper = adResponseMapper;
        this.jwtUtils = jwtUtils;
        this.cloudinary = cloudinary;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public List<AdCampaignResponseModel> getAllAdCampaignsByBusinessId(String businessId) {
        List<AdCampaign> adCampaigns = adCampaignRepository.findAllByBusinessId_BusinessId(businessId);
        return adCampaignResponseMapper.entitiesToResponseModelList(adCampaigns);
    }

    @Override
    public AdCampaignResponseModel getAdCampaignByCampaignId(String campaignId) {
        AdCampaign adCampaign = adCampaignRepository.findByCampaignId_CampaignId(campaignId);

        if (adCampaign == null){
            throw new AdCampaignNotFoundException(campaignId);
        }

        return adCampaignResponseMapper.entityToResponseModel(adCampaign);
    }

    @Override
    public AdCampaignResponseModel createAdCampaign(Jwt jwt, String businessId,
            AdCampaignRequestModel adCampaignRequestModel) {
        Business business = businessRepository.findByBusinessId_BusinessId(businessId);

        if (business == null) {
            throw new BusinessNotFoundException(businessId);
        }

        String userId = jwtUtils.extractUserId(jwt);
        jwtUtils.validateUserIsEmployeeOfBusiness(userId, businessId);

        AdCampaign adCampaign = adCampaignRequestMapper.requestModelToEntity(adCampaignRequestModel);
        adCampaign.setCampaignId(new AdCampaignIdentifier());
        adCampaign.setBusinessId(new BusinessIdentifier(businessId));

        return adCampaignResponseMapper.entityToResponseModel(adCampaignRepository.save(adCampaign));
    }

    @Override
    public List<String> getAllCampaignImageLinks(String campaignId) {
        AdCampaign adCampaign = adCampaignRepository.findByCampaignId_CampaignId(campaignId);
        if (adCampaign == null) {
            throw new AdCampaignNotFoundException(campaignId);
        }

        return adCampaign.getAds().stream()
                .map(Ad::getAdUrl)
                .filter(url -> url != null && !url.isEmpty())
                .toList();
    }

    @Override
    public AdResponseModel addAdToCampaign(String campaignId, AdRequestModel adRequestModel) {
        AdCampaign adCampaign = adCampaignRepository.findByCampaignId_CampaignId(campaignId);
        if (adCampaign == null)
            throw new AdCampaignNotFoundException(campaignId);

        Ad newAd = adRequestMapper.requestModelToEntity(adRequestModel);
        newAd.setAdIdentifier(new AdIdentifier());

        try {
            // valueOf throws IllegalArgumentException if the string doesn't match exactly
            AdType type = AdType.valueOf(adRequestModel.getAdType());
            newAd.setAdType(type);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidAdTypeException(adRequestModel.getAdType());
        }

        try {
            newAd.setAdDurationSeconds(AdDuration.fromSeconds(adRequestModel.getAdDurationSeconds()));
        } catch (Exception e) { // Catch validation errors from AdDuration constructor
            throw new InvalidAdDurationException(adRequestModel.getAdDurationSeconds());
        }

        newAd.setCampaign(adCampaign);
        adCampaign.getAds().add(newAd);

        adCampaignRepository.save(adCampaign);
        return adResponseMapper.entityToResponseModel(newAd);
    }

    @Override
    public AdResponseModel deleteAdFromCampaign(String campaignId, String adId) {
        AdCampaign adCampaign = adCampaignRepository.findByCampaignId_CampaignId(campaignId);
        if (adCampaign == null) {
            throw new AdCampaignNotFoundException(campaignId);
        }

        Ad adToDelete = adCampaign.getAds().stream()
                .filter(ad -> ad.getAdIdentifier().getAdIdentifier().equals(adId))
                .findFirst()
                .orElseThrow(() -> new AdNotFoundException(adId));

        deleteCloudinaryAssetIfPresent(adToDelete.getAdUrl());

        adCampaign.getAds().remove(adToDelete);
        adCampaignRepository.save(adCampaign);

        return adResponseMapper.entityToResponseModel(adToDelete);
    }

    private void deleteCloudinaryAssetIfPresent(String url) {
        if (url == null) return;

        url = url.trim();
        if (url.isBlank()) return;

        try {
            String publicId = CloudinaryConfig.getPublicIdFromUrl(url);
            if (publicId == null || publicId.isBlank()) return;

            String resourceType = CloudinaryConfig.getResourceTypeFromUrl(url);

            Map<String, Object> options = new HashMap<>();
            options.put("invalidate", true);
            options.put("resource_type", resourceType);

            cloudinary.uploader().destroy(publicId, options);

        } catch (Exception e) {
            log.warn("Failed to delete Cloudinary asset for url={}", url, e);
        }
    }


    @Override
    public Integer getActiveCampaignCount(String businessId) {
        return reservationRepository.countActiveCampaignsByAdvertiserId(businessId, LocalDateTime.now());
    }
}
