package com.envisionad.webservice.Media.PresentationLayer;

import com.envisionad.webservice.Media.BusinessLayer.MediaService;
import com.envisionad.webservice.Media.DataAccessLayer.Media;
import com.envisionad.webservice.Media.MapperLayer.MediaRequestMapper;
import com.envisionad.webservice.Media.MapperLayer.MediaResponseMapper;
import com.envisionad.webservice.Media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.Media.PresentationLayer.Models.MediaResponseModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}