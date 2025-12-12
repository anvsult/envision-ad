package com.envisionad.webservice.business.presentationlayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/businesses")
//@CrossOrigin(origins = "http://localhost:3000")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @PostMapping
    public ResponseEntity<BusinessResponseModel> createBusiness(@RequestBody BusinessRequestModel requestModel) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businessService.createBusiness(requestModel));
    }

    @GetMapping
    public ResponseEntity<List<BusinessResponseModel>> getAllBusinesses() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }

    @GetMapping("/{businessId}")
    public ResponseEntity<BusinessResponseModel> getBusinessById(@PathVariable String businessId) {
        return ResponseEntity.ok(businessService.getBusinessById(businessId));
    }

    @PutMapping("/{businessId}")
    public ResponseEntity<BusinessResponseModel> updateBusinessById(@PathVariable String businessId, @RequestBody BusinessRequestModel requestModel) {
        return ResponseEntity.ok(businessService.updateBusinessById(businessId, requestModel));
    }

    @DeleteMapping("/{businessId}")
    public ResponseEntity<BusinessResponseModel> deleteBusinessById(@PathVariable String businessId) {
        return ResponseEntity.ok(businessService.deleteBusinessById(businessId));
    }

    @PutMapping("/{businessId}/employees/{employeeId}")
    public ResponseEntity<BusinessResponseModel> addEmployeeToBusiness(@PathVariable String businessId, @PathVariable String employeeId) {
        return ResponseEntity.ok(businessService.addBusinessEmployeeById(businessId, employeeId));
    }

    @DeleteMapping("/{businessId}/employees/{employeeId}")
    public ResponseEntity<BusinessResponseModel> removeEmployeeToBusiness(@PathVariable String businessId, @PathVariable String employeeId) {
        return ResponseEntity.ok(businessService.removeBusinessEmployeeById(businessId, employeeId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<BusinessResponseModel> getBusinessByEmployeeId(@PathVariable String employeeId) {
        return ResponseEntity.ok(businessService.getBusinessByEmployeeId(employeeId));
    }
}
