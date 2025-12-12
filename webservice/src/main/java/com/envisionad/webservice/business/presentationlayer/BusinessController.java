package com.envisionad.webservice.business.presentationlayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/businesses")
@CrossOrigin(origins = "http://localhost:3000")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @PostMapping
    public ResponseEntity<BusinessResponseModel> createBusiness(@AuthenticationPrincipal Jwt jwt, @RequestBody BusinessRequestModel requestModel) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businessService.createBusiness(jwt, requestModel));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('readAll:business')")
    public ResponseEntity<List<BusinessResponseModel>> getAllBusinesses() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }

    @GetMapping("/{businessId}")
    @PreAuthorize("hasAuthority('read:business')")
    public ResponseEntity<BusinessResponseModel> getBusinessById(@PathVariable String businessId) {
        return ResponseEntity.ok(businessService.getBusinessById(businessId));
    }

    @PutMapping("/{businessId}")
    @PreAuthorize("hasAuthority('update:business')")
    public ResponseEntity<BusinessResponseModel> updateBusinessById(@AuthenticationPrincipal Jwt jwt, @PathVariable String businessId, @RequestBody BusinessRequestModel requestModel) {
        return ResponseEntity.ok(businessService.updateBusinessById(jwt, businessId, requestModel));
    }

    //Will be replace with another endpoint for adding employees by email
    @PutMapping("/{businessId}/employees/{employeeId}")
    public ResponseEntity<BusinessResponseModel> addEmployeeToBusiness(@PathVariable String businessId, @PathVariable String employeeId) {
        return ResponseEntity.ok(businessService.addBusinessEmployeeById(businessId, employeeId));
    }

    @DeleteMapping("/{businessId}/employees/{employeeId}")
    @PreAuthorize("hasAuthority('delete:employee')")
    public ResponseEntity<BusinessResponseModel> removeEmployeeToBusiness(@AuthenticationPrincipal Jwt jwt, @PathVariable String businessId, @PathVariable String employeeId) {
        return ResponseEntity.ok(businessService.removeBusinessEmployeeById(jwt, businessId, employeeId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<BusinessResponseModel> getBusinessByEmployeeId(@AuthenticationPrincipal Jwt jwt, @PathVariable String employeeId) {
        return ResponseEntity.ok(businessService.getBusinessByEmployeeId(jwt, employeeId));
    }
}
