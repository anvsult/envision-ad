package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.BusinessLayer.MediaService;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.MapperLayer.MediaRequestMapper;
import com.envisionad.webservice.media.MapperLayer.MediaResponseMapper;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import com.envisionad.webservice.media.util.MediaRequestValidator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/media") // Base URL: http://localhost:8080
@CrossOrigin(origins = "http://localhost:3000")
public class MediaController {

    private final MediaService mediaService;
    private final MediaRequestMapper requestMapper;
    private final MediaResponseMapper responseMapper;
    private final MediaRequestValidator validator;

    public MediaController(MediaService mediaService,
            MediaRequestMapper requestMapper,
            MediaResponseMapper responseMapper,
            MediaRequestValidator validator) {
        this.mediaService = mediaService;
        this.requestMapper = requestMapper;
        this.responseMapper = responseMapper;
        this.validator = validator;
    }

    @GetMapping
    public List<MediaResponseModel> getAllMedia() {
        return responseMapper.entityListToResponseModelList(mediaService.getAllMedia());
    }

    @GetMapping("/active")
    public ResponseEntity<?> getAllFilteredActiveMedia(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minDailyImpressions) {
        // Input validation
        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body("minPrice must be non-negative.");
        }
        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body("maxPrice must be non-negative.");
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            return ResponseEntity.badRequest().body("minPrice must not be greater than maxPrice.");
        }
        if (minDailyImpressions != null && minDailyImpressions < 0) {
            return ResponseEntity.badRequest().body("minDailyImpressions must be non-negative.");
        }
        List<MediaResponseModel> result = responseMapper.entityListToResponseModelList(
                mediaService.getAllFilteredActiveMedia(title, minPrice, maxPrice, minDailyImpressions));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaResponseModel> getMediaById(@PathVariable String id) {
        Media media = mediaService.getMediaById(id);
        if (media == null) {
            return ResponseEntity.notFound().build(); // Returns 404 if not found
        }
        return ResponseEntity.ok(responseMapper.entityToResponseModel(media));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create:media')")
    public ResponseEntity<MediaResponseModel> addMedia(@RequestBody MediaRequestModel requestModel) {
        try {
            validator.validate(requestModel);
        } catch (IllegalArgumentException e) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
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
        try {
            validator.validate(requestModel);
        } catch (IllegalArgumentException e) {
            // Return Bad Request if validation fails
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        Media entity = requestMapper.requestModelToEntity(requestModel);

        entity.setId(id);

        Media updatedEntity = mediaService.updateMedia(entity);
        return ResponseEntity.ok(responseMapper.entityToResponseModel(updatedEntity));
    }

    //this endpoint will probably be deleted
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable String id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }

    //image handling will not be done this way
    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(@PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        Media media = mediaService.getMediaById(id);
        if (media == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            media.setImageFileName(file.getOriginalFilename());
            media.setImageContentType(file.getContentType());
            media.setImageData(file.getBytes());
            Media saved = mediaService.updateMedia(media);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("/api/v1/media/" + saved.getId() + "/image");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable String id) {
        Media media = mediaService.getMediaById(id);
        if (media == null || media.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        String contentType = media.getImageContentType() != null ? media.getImageContentType()
                : "application/octet-stream";
        headers.setContentType(MediaType.parseMediaType(contentType));
        if (media.getImageFileName() != null) {
            headers.setContentDispositionFormData("inline", media.getImageFileName());
        }

        return new ResponseEntity<>(media.getImageData(), headers, HttpStatus.OK);
    }
}