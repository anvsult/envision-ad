package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import com.envisionad.webservice.media.BusinessLayer.MediaLocationService;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.MapperLayer.MediaLocationRequestMapper;
import com.envisionad.webservice.media.MapperLayer.MediaLocationResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationResponseModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media-locations")
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "https://envision-ad.ca" })
public class MediaLocationController {

    private final MediaLocationService mediaLocationService;
    private final MediaLocationRequestMapper requestMapper;
    private final MediaLocationResponseMapper responseMapper;
    private final BusinessService businessService;

    public MediaLocationController(MediaLocationService mediaLocationService,
            MediaLocationRequestMapper requestMapper,
            MediaLocationResponseMapper responseMapper,
            BusinessService businessService) {
        this.mediaLocationService = mediaLocationService;
        this.requestMapper = requestMapper;
        this.responseMapper = responseMapper;
        this.businessService = businessService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('read:media_location')")
    public ResponseEntity<List<MediaLocationResponseModel>> getAllMediaLocations(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String businessId) {

        try {
            return ResponseEntity.ok(responseMapper.entityListToResponseModelList(
                    mediaLocationService.getAllMediaLocations(jwt, businessId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('read:media_location')")
    public ResponseEntity<MediaLocationResponseModel> getMediaLocationById(@AuthenticationPrincipal Jwt jwt,
            @PathVariable String id) {
        MediaLocation location = mediaLocationService.getMediaLocationById(UUID.fromString(id));
        if (location == null) {
            return ResponseEntity.notFound().build();
        }
        if (!canAccessLocation(jwt, location)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(responseMapper.entityToResponseModel(location));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:media_location')")
    public ResponseEntity<MediaLocationResponseModel> createMediaLocation(@AuthenticationPrincipal Jwt jwt,
            @RequestBody MediaLocationRequestModel requestModel) {

        MediaLocation entity = requestMapper.requestModelToEntity(requestModel);
        MediaLocation savedEntity = mediaLocationService.createMediaLocation(entity, jwt);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseMapper.entityToResponseModel(savedEntity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:media_location')")
    public ResponseEntity<MediaLocationResponseModel> updateMediaLocation(@AuthenticationPrincipal Jwt jwt,
            @PathVariable String id,
            @RequestBody MediaLocationRequestModel requestModel) {

        MediaLocation existing = mediaLocationService.getMediaLocationById(UUID.fromString(id));
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (!canAccessLocation(jwt, existing)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        MediaLocation updateEntity = requestMapper.requestModelToEntity(requestModel);
        MediaLocation updated = mediaLocationService.updateMediaLocation(UUID.fromString(id), updateEntity);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(responseMapper.entityToResponseModel(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:media_location')") // Change to delete:media when added to Auth0
    public ResponseEntity<Void> deleteMediaLocation(@AuthenticationPrincipal Jwt jwt,
            @PathVariable String id) {
        MediaLocation location = mediaLocationService.getMediaLocationById(UUID.fromString(id));
        if (location != null && !canAccessLocation(jwt, location)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        mediaLocationService.deleteMediaLocation(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }

    private boolean canAccessLocation(Jwt jwt, MediaLocation location) {
        if (jwt == null || location == null || location.getBusinessId() == null) {
            return false;
        }
        try {
            BusinessResponseModel business = businessService.getBusinessByUserId(jwt, jwt.getSubject());
            if (business == null || business.getBusinessId() == null) {
                return false;
            }
            UUID authenticatedBusinessId = UUID.fromString(business.getBusinessId());
            return authenticatedBusinessId.equals(location.getBusinessId());
        } catch (Exception e) {
            log.error("Error authorizing media location access for user {}: {}", jwt.getSubject(), e.getMessage(), e);
            return false;
        }
    }

}
