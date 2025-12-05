package com.envisionad.webservice.Media.PresentationLayer;

import com.envisionad.webservice.Media.BusinessLayer.MediaService;
import com.envisionad.webservice.Media.DataAccessLayer.Media;
import com.envisionad.webservice.Media.MapperLayer.MediaRequestMapper;
import com.envisionad.webservice.Media.MapperLayer.MediaResponseMapper;
import com.envisionad.webservice.Media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.Media.PresentationLayer.Models.MediaResponseModel;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media") // Base URL: http://localhost:8080
public class MediaController {

    private final MediaService mediaService;
    private final MediaRequestMapper requestMapper;
    private final MediaResponseMapper responseMapper;

    public MediaController(MediaService mediaService,
                           MediaRequestMapper requestMapper,
                           MediaResponseMapper responseMapper) {
        this.mediaService = mediaService;
        this.requestMapper = requestMapper;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    public List<MediaResponseModel> getAllMedia() {
        return responseMapper.entityListToResponseModelList(mediaService.getAllMedia());
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
    public ResponseEntity<MediaResponseModel> addMedia(@RequestBody MediaRequestModel requestModel) {
        Media entity = requestMapper.requestModelToEntity(requestModel);

        Media savedEntity = mediaService.addMedia(entity);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseMapper.entityToResponseModel(savedEntity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MediaResponseModel> updateMedia(@PathVariable String id,
                                                          @RequestBody MediaRequestModel requestModel) {
        Media entity = requestMapper.requestModelToEntity(requestModel);

        entity.setId(id);

        Media updatedEntity = mediaService.updateMedia(entity);
        return ResponseEntity.ok(responseMapper.entityToResponseModel(updatedEntity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable String id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }

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
        String contentType = media.getImageContentType() != null ? media.getImageContentType() : "application/octet-stream";
        headers.setContentType(MediaType.parseMediaType(contentType));
        if (media.getImageFileName() != null) {
            headers.setContentDispositionFormData("inline", media.getImageFileName());
        }

        return new ResponseEntity<>(media.getImageData(), headers, HttpStatus.OK);
    }
}