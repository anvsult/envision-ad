package com.envisionad.webservice.business.presentationlayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.mappinglayer.BusinessResponseMapper;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/businesses")
public class BusinessController {

    private final BusinessService businessService;
    private final BusinessResponseMapper businessResponseMapper;

    public BusinessController(BusinessService businessService, BusinessResponseMapper businessResponseMapper) {
        this.businessService = businessService;
        this.businessResponseMapper = businessResponseMapper;
    }

    @PostMapping
    public ResponseEntity<BusinessResponseModel> createBusiness(@RequestBody BusinessRequestModel requestModel) {
        Business businessEntity = businessResponseMapper.requestModelToEntity(requestModel);

        Business savedBusiness = businessService.createBusiness(businessEntity);

        BusinessResponseModel responseModel = businessResponseMapper.entityToResponseModel(savedBusiness);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseModel);
    }

    @GetMapping
    public ResponseEntity<List<BusinessResponseModel>> getAllBusinesses() {
        List<BusinessResponseModel> responseModels = businessService.getAllBusinesses().stream()
                .map(businessResponseMapper::entityToResponseModel)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseModels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponseModel> getBusinessById(@PathVariable UUID id) {
        Business business = businessService.getBusinessById(id);
        BusinessResponseModel responseModel = businessResponseMapper.entityToResponseModel(business);

        return ResponseEntity.ok(responseModel);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessResponseModel> updateBusinessById(
            @PathVariable UUID id,
            @RequestBody BusinessRequestModel requestModel) {
        Business businessEntity = businessResponseMapper.requestModelToEntity(requestModel);
        Business updatedBusiness = businessService.updateBusinessById(id, businessEntity);
        BusinessResponseModel responseModel = businessResponseMapper.entityToResponseModel(updatedBusiness);

        return ResponseEntity.ok(responseModel);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BusinessResponseModel> deleteBusinessById(@PathVariable UUID id) {
        Business deletedBusiness = businessService.deleteBusinessById(id);
        BusinessResponseModel responseModel = businessResponseMapper.entityToResponseModel(deletedBusiness);

        return ResponseEntity.ok(responseModel);
    }
}
