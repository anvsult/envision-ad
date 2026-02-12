package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.BusinessLayer.MediaService;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
    @PreAuthorize("hasAuthority('read:media')")
    public ResponseEntity<List<MediaResponseModel>> getMediaByBusinessId(@AuthenticationPrincipal Jwt jwt, @PathVariable String businessId) {
        return ResponseEntity.ok(mediaService.getMediaByBusinessId(jwt, businessId));
    }
}
