package com.envisionad.webservice.advertisement.presentationlayer;

import com.envisionad.webservice.advertisement.businesslogiclayer.AdCampaignService;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignResponseModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/ad-campaigns")
@CrossOrigin(origins = "http://localhost:3000")
public class AdCampaignController {
    private final AdCampaignService adCampaignService;

    public AdCampaignController(AdCampaignService adCampaignService) {
        this.adCampaignService = adCampaignService;
    }

    @GetMapping()
    public ResponseEntity<List<AdCampaignResponseModel>> getAllAdCampaigns() {
        return ResponseEntity.ok(adCampaignService.getAllAdCampaigns());
    }

    @PostMapping()
    public ResponseEntity<AdCampaignResponseModel> createAdCampaign(
            @RequestBody AdCampaignRequestModel adCampaignRequestModel
            ) {
        AdCampaignResponseModel newCampaign = adCampaignService.createAdCampaign(adCampaignRequestModel);

        return ResponseEntity.status(HttpStatus.CREATED).body(newCampaign);
    }

    @PostMapping("/{campaignId}/ads")
    public ResponseEntity<AdResponseModel> addAdToCampaign(
            @PathVariable String campaignId,
            @RequestBody AdRequestModel adRequestModel) {
        AdResponseModel newAd = adCampaignService.addAdToCampaign(campaignId, adRequestModel);

        return ResponseEntity.status(HttpStatus.CREATED).body(newAd);

    }

    @DeleteMapping("/{campaignId}/ads/{adId}")
    public ResponseEntity<AdResponseModel> deleteAdFromCampaign(
            @PathVariable String campaignId,
            @PathVariable String adId) {
        AdResponseModel deletedAd = adCampaignService.deleteAdFromCampaign(campaignId, adId);

        return ResponseEntity.ok(deletedAd);
    }
}
