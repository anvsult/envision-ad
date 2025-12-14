package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.*;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignResponseMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdResponseMapper;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.advertisement.exceptions.AdNotFoundException;
import com.envisionad.webservice.advertisement.exceptions.InvalidAdTypeException;
import com.envisionad.webservice.advertisement.exceptions.InvalidAdDurationException;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignResponseModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdCampaignServiceImpl implements AdCampaignService {
    private final AdCampaignRepository adCampaignRepository;
    private final AdCampaignRequestMapper adCampaignRequestMapper;
    private final AdCampaignResponseMapper adCampaignResponseMapper;
    private final AdRequestMapper adRequestMapper;
    private final AdResponseMapper adResponseMapper;

    public AdCampaignServiceImpl(AdCampaignRepository adCampaignRepository, AdCampaignRequestMapper adCampaignRequestMapper, AdCampaignResponseMapper adCampaignResponseMapper, AdRequestMapper adRequestMapper, AdResponseMapper adResponseMapper) {
        this.adCampaignRepository = adCampaignRepository;
        this.adCampaignRequestMapper = adCampaignRequestMapper;
        this.adCampaignResponseMapper = adCampaignResponseMapper;
        this.adRequestMapper = adRequestMapper;
        this.adResponseMapper = adResponseMapper;
    }

    @Override
    public List<AdCampaignResponseModel> getAllAdCampaigns() {
        List<AdCampaign> adCampaigns = adCampaignRepository.findAll();
        return adCampaignResponseMapper.entitiesToResponseModelList(adCampaigns);
    }

    @Override
    public AdResponseModel addAdToCampaign(String campaignId, AdRequestModel adRequestModel) {
        AdCampaign adCampaign = adCampaignRepository.findByCampaignId_CampaignId(campaignId);
        if (adCampaign == null) throw new AdCampaignNotFoundException(campaignId);

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

        adCampaign.getAds().remove(adToDelete);
        adCampaignRepository.save(adCampaign);

        return adResponseMapper.entityToResponseModel(adToDelete);
    }
}
