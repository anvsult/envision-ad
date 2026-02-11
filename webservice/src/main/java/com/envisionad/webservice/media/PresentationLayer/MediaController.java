package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.BusinessLayer.MediaService;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.MapperLayer.MediaRequestMapper;
import com.envisionad.webservice.media.MapperLayer.MediaResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.envisionad.webservice.media.BusinessLayer.MediaRequestValidator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;

import java.util.List;
import java.util.UUID;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/media")
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "https://envision-ad.ca" })
public class MediaController {

    private final MediaService mediaService;
    private final MediaRequestMapper requestMapper;
    private final MediaResponseMapper responseMapper;
    private final BusinessService businessService;

    public MediaController(MediaService mediaService,
            MediaRequestMapper requestMapper,
            MediaResponseMapper responseMapper,
            BusinessService businessService) {
        this.mediaService = mediaService;
        this.requestMapper = requestMapper;
        this.responseMapper = responseMapper;
        this.businessService = businessService;
    }

    @GetMapping
    public List<MediaResponseModel> getAllMedia() {
        return responseMapper.entityListToResponseModelList(mediaService.getAllMedia());
    }

    @GetMapping("/active")
    public ResponseEntity<?> getAllFilteredActiveMedia(
            Pageable pageable,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String businessId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minDailyImpressions,
            @RequestParam(required = false) String specialSort,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false) List<Double> bounds,
            @RequestParam(required = false) String excludedId) {

        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("minPrice must be non-negative.");
        }
        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("maxPrice must be non-negative.");
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("minPrice must not be greater than maxPrice.");
        }
        if (minDailyImpressions != null && minDailyImpressions < 0) {
            throw new IllegalArgumentException("minDailyImpressions must be non-negative.");
        }

        if (bounds != null && bounds.size() != 4) {
            throw new IllegalArgumentException("bounds must have a length of exactly 4.");
        }

        Page<MediaResponseModel> responsePage = mediaService.getAllFilteredActiveMedia(
                pageable,
                title,
                businessId,
                minPrice,
                maxPrice,
                minDailyImpressions,
                specialSort,
                userLat,
                userLng,
                bounds,
                excludedId).map(responseMapper::entityToResponseModel);

        return ResponseEntity.ok(responsePage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaResponseModel> getMediaById(@PathVariable String id) {
        Media media = mediaService.getMediaById(UUID.fromString(id));
        if (media == null) {
            return ResponseEntity.notFound().build(); // Returns 404 if not found
        }
        return ResponseEntity.ok(responseMapper.entityToResponseModel(media));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:media')")
    public ResponseEntity<MediaResponseModel> addMedia(@AuthenticationPrincipal Jwt jwt,
            @RequestBody MediaRequestModel requestModel) {
        MediaRequestValidator.validateMediaRequest(requestModel);

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

        Media entity = requestMapper.requestModelToEntity(requestModel);
        Media savedEntity = mediaService.addMedia(entity);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseMapper.entityToResponseModel(savedEntity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('update:media')")
    public ResponseEntity<MediaResponseModel> updateMedia(@PathVariable String id,
            @RequestBody MediaRequestModel requestModel) {
        MediaRequestValidator.validateMediaRequest(requestModel);

        Media existingMedia = mediaService.getMediaById(UUID.fromString(id));
        if (existingMedia == null) {
            return ResponseEntity.notFound().build();
        }

        Media entity = requestMapper.requestModelToEntity(requestModel);
        entity.setId(UUID.fromString(id));
        entity.setBusinessId(existingMedia.getBusinessId()); // Persist businessId

        Media updatedEntity = mediaService.updateMedia(entity);
        return ResponseEntity.ok(responseMapper.entityToResponseModel(updatedEntity));
    }

    // this endpoint will probably be deleted
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable String id) {
        mediaService.deleteMedia(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }
}