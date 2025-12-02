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

@RestController
@RequestMapping("/api/v1/media") // Base URL: http://localhost:8080/api/v1/media
@CrossOrigin(origins = "http://localhost:3000") // Optional: Allows your frontend (React/Angular) to talk to this API
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

    // 1. GET ALL MEDIA
    @GetMapping
    public List<MediaResponseModel> getAllMedia() {
        // Get entities from service -> Convert to Response Models -> Return list
        return responseMapper.entityListToResponseModelList(mediaService.getAllMedia());
    }

    // 2. GET ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<MediaResponseModel> getMediaById(@PathVariable Integer id) {
        Media media = mediaService.getMediaById(id);
        if (media == null) {
            return ResponseEntity.notFound().build(); // Returns 404 if not found
        }
        return ResponseEntity.ok(responseMapper.entityToResponseModel(media));
    }

    // 3. CREATE NEW MEDIA
    @PostMapping
    public ResponseEntity<MediaResponseModel> addMedia(@RequestBody MediaRequestModel requestModel) {
        // Convert Request -> Entity
        Media entity = requestMapper.requestModelToEntity(requestModel);

        // Save via Service
        Media savedEntity = mediaService.addMedia(entity);

        // Convert Entity -> Response (includes the new ID)
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseMapper.entityToResponseModel(savedEntity));
    }

    // 4. UPDATE EXISTING MEDIA
    @PutMapping("/{id}")
    public ResponseEntity<MediaResponseModel> updateMedia(@PathVariable Integer id,
                                                          @RequestBody MediaRequestModel requestModel) {
        // Convert Request -> Entity
        Media entity = requestMapper.requestModelToEntity(requestModel);

        // IMPORTANT: Ensure the ID is set so JPA knows to update, not create
        entity.setId(id);

        Media updatedEntity = mediaService.updateMedia(entity);
        return ResponseEntity.ok(responseMapper.entityToResponseModel(updatedEntity));
    }

    // 5. DELETE MEDIA
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Integer id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build(); // Returns 204 No Content (standard for delete)
    }
}