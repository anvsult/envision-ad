package com.envisionad.webservice.advertisement.presentationlayer;

import com.envisionad.webservice.advertisement.businesslogiclayer.AdService;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ads")
public class AdController {
    private final AdService adService;

    public AdController(AdService adService) {
        this.adService = adService;
    }

    @GetMapping
    public ResponseEntity<List<AdResponseModel>> getAllAds() {
        return ResponseEntity.ok().body(adService.getAllAds());
    }
}
