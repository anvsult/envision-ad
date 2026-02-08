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
    public ResponseEntity<List<MediaLocationResponseModel>> getAllMediaLocations(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String businessId) {

        String targetBusinessId = businessId;

        // If businessId is not provided, try to infer from JWT
        if (targetBusinessId == null && jwt != null) {
            try {
                BusinessResponseModel business = businessService.getBusinessByUserId(jwt, jwt.getSubject());
                if (business != null) {
                    targetBusinessId = business.getBusinessId();
                }
            } catch (Exception e) {
                log.error("Error fetching business for user {}: {}", jwt.getSubject(), e.getMessage());
            }
        }

        if (targetBusinessId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(responseMapper.entityListToResponseModelList(
                mediaLocationService.getAllMediaLocationsByBusinessId(UUID.fromString(targetBusinessId))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('read:media_location')")
    public ResponseEntity<MediaLocationResponseModel> getMediaLocationById(@PathVariable String id) {
        MediaLocation location = mediaLocationService.getMediaLocationById(UUID.fromString(id));
        if (location == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(responseMapper.entityToResponseModel(location));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:media_location')")
    public ResponseEntity<MediaLocationResponseModel> createMediaLocation(@AuthenticationPrincipal Jwt jwt,
            @RequestBody MediaLocationRequestModel requestModel) {

        if (jwt != null) {
            try {
                BusinessResponseModel business = businessService.getBusinessByUserId(jwt, jwt.getSubject());
                if (business != null && business.getBusinessId() != null) {
                    requestModel.setBusinessId(business.getBusinessId());
                }
            } catch (Exception e) {
                log.error("Error fetching business for user {}: {}", jwt.getSubject(), e.getMessage(), e);
            }
        }

        MediaLocation entity = requestMapper.requestModelToEntity(requestModel);
        MediaLocation savedEntity = mediaLocationService.createMediaLocation(entity);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseMapper.entityToResponseModel(savedEntity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:media_location')")
    public ResponseEntity<MediaLocationResponseModel> updateMediaLocation(@PathVariable String id,
            @RequestBody MediaLocationRequestModel requestModel) {
        MediaLocation existing = mediaLocationService.getMediaLocationById(UUID.fromString(id));
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // Map updates to entity - simple version
        MediaLocation updateEntity = requestMapper.requestModelToEntity(requestModel);
        updateEntity.setId(UUID.fromString(id));
        updateEntity.setBusinessId(existing.getBusinessId()); // Keep original businessId

        MediaLocation updated = mediaLocationService.updateMediaLocation(updateEntity);
        return ResponseEntity.ok(responseMapper.entityToResponseModel(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:media_location')") // Change to delete:media when added to Auth0
    public ResponseEntity<Void> deleteMediaLocation(@PathVariable String id) {
        mediaLocationService.deleteMediaLocation(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/assign/{mediaId}")
    @PreAuthorize("hasAuthority('update:media_location')") // Change to update:media when added to Auth0
    public ResponseEntity<Void> assignMediaToLocation(@PathVariable String id, @PathVariable String mediaId) {
        mediaLocationService.assignMediaToLocation(UUID.fromString(id), UUID.fromString(mediaId));
        return ResponseEntity.ok().build();
    }
}
