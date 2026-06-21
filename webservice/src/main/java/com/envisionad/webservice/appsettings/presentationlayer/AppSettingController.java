package com.envisionad.webservice.appsettings.presentationlayer;

import com.envisionad.webservice.appsettings.businesslogiclayer.AppSettingService;
import com.envisionad.webservice.appsettings.dataaccesslayer.AppSetting;
import com.envisionad.webservice.appsettings.presentationlayer.models.AppSettingRequestModel;
import com.envisionad.webservice.appsettings.presentationlayer.models.AppSettingResponseModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@CrossOrigin(origins = {"http://localhost:3000", "https://envision-ad.ca"})
public class AppSettingController {

    private final AppSettingService service;

    public AppSettingController(AppSettingService service) {
        this.service = service;
    }

    @GetMapping("/{key}")
    public ResponseEntity<AppSettingResponseModel> getByKey(@PathVariable String key) {
        return service.findByKey(key)
                .map(s -> {
                    AppSettingResponseModel model = new AppSettingResponseModel();
                    model.setKey(s.getKey());
                    model.setValue(s.getValue());
                    return ResponseEntity.ok(model);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasAuthority('manage:venues')")
    public ResponseEntity<AppSettingResponseModel> upsert(
            @PathVariable String key,
            @RequestBody AppSettingRequestModel request) {
        AppSetting saved = service.upsert(key, request.getValue());
        AppSettingResponseModel model = new AppSettingResponseModel();
        model.setKey(saved.getKey());
        model.setValue(saved.getValue());
        return ResponseEntity.ok(model);
    }
}
