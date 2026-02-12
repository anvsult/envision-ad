package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.BusinessLayer.MediaService;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/media")
@CrossOrigin(origins = { "http://localhost:3000", "https://envision-ad.ca" })
public class BusinessMediaController {
    private final MediaService mediaService;

    public BusinessMediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping()
    public ResponseEntity<List<MediaResponseModel>> getMediaByBusinessId(@PathVariable String businessId) {
        return ResponseEntity.ok(mediaService.getMediaByBusinessId(businessId));
    }
}
