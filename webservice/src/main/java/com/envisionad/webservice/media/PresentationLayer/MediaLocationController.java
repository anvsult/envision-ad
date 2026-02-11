package com.envisionad.webservice.media.PresentationLayer;

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

    public MediaLocationController(MediaLocationService mediaLocationService,
            MediaLocationRequestMapper requestMapper,
            MediaLocationResponseMapper responseMapper) {
        this.mediaLocationService = mediaLocationService;
        this.requestMapper = requestMapper;
        this.responseMapper = responseMapper;
    }

    @GetMapping
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

        MediaLocation entity = requestMapper.requestModelToEntity(requestModel);

        try {
            MediaLocation savedEntity = mediaLocationService.createMediaLocation(entity, jwt);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(responseMapper.entityToResponseModel(savedEntity));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:media_location')")
    public ResponseEntity<MediaLocationResponseModel> updateMediaLocation(@PathVariable String id,
            @RequestBody MediaLocationRequestModel requestModel) {

        MediaLocation updateEntity = requestMapper.requestModelToEntity(requestModel);
        MediaLocation updated = mediaLocationService.updateMediaLocation(UUID.fromString(id), updateEntity);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(responseMapper.entityToResponseModel(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete:media_location')") // Change to delete:media when added to Auth0
    public ResponseEntity<Void> deleteMediaLocation(@PathVariable String id) {
        mediaLocationService.deleteMediaLocation(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }

}
