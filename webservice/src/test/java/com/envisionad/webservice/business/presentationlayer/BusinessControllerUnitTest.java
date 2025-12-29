package com.envisionad.webservice.business.presentationlayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier;
import com.envisionad.webservice.business.dataaccesslayer.OrganizationSize;
import com.envisionad.webservice.business.mappinglayer.BusinessMapper;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = BusinessController.class)
class BusinessControllerUnitTest {

    @MockitoBean
    private BusinessService businessService;

    @MockitoBean
    private BusinessMapper businessMapper;

    @Autowired
    private BusinessController businessController;

    private Business business;
    private BusinessResponseModel responseModel;
    private BusinessRequestModel requestModel;
    private Jwt mockJwt;
    private final String businessId = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        mockJwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|65702e81e9661e14ab3aac89")
                .claim("scope", "read write")
                .build();

        Address address = new Address("123 Street", "City", "State", "12345", "Country");

        business = new Business();
        business.setBusinessId(new BusinessIdentifier(businessId));
        business.setName("Test Business");
        business.setOrganizationSize(OrganizationSize.SMALL);
        business.setAddress(address);
        business.setDateCreated(LocalDateTime.now());

        responseModel = new BusinessResponseModel();
        responseModel.setBusinessId(businessId);
        responseModel.setName("Test Business");
        responseModel.setOrganizationSize(OrganizationSize.SMALL);
        responseModel.setAddress(address);
        responseModel.setDateCreated(business.getDateCreated());

        requestModel = new BusinessRequestModel();
        requestModel.setName("Test Business");
        requestModel.setOrganizationSize(OrganizationSize.SMALL);
        requestModel.setAddress(address);
    }

    @Test
    void createBusiness_ShouldReturnCreatedBusiness() {
        when(businessService.createBusiness(any(Jwt.class), any(BusinessRequestModel.class))).thenReturn(responseModel);

        ResponseEntity<BusinessResponseModel> response = businessController.createBusiness(mockJwt, requestModel);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(businessId, response.getBody().getBusinessId());
        assertEquals("Test Business", response.getBody().getName());
        verify(businessService, times(1)).createBusiness(any(Jwt.class), any(BusinessRequestModel.class));
    }

    @Test
    void getAllBusinesses_ShouldReturnListOfBusinesses() {
        List<BusinessResponseModel> businessList = Collections.singletonList(responseModel);

        when(businessService.getAllBusinesses()).thenReturn(businessList);

        ResponseEntity<List<BusinessResponseModel>> response = businessController.getAllBusinesses();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(businessId, response.getBody().getFirst().getBusinessId());
        assertEquals("Test Business", response.getBody().getFirst().getName());
        verify(businessService, times(1)).getAllBusinesses();
    }

    @Test
    void getBusinessById_WhenFound_ShouldReturnBusiness() {
        when(businessService.getBusinessById(businessId)).thenReturn(responseModel);

        ResponseEntity<BusinessResponseModel> response = businessController.getBusinessById(businessId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(businessId, response.getBody().getBusinessId());
        verify(businessService, times(1)).getBusinessById(businessId);
    }

    @Test
    void updateBusinessById_ShouldReturnUpdatedBusiness() {
        when(businessService.updateBusinessById(any(Jwt.class), eq(businessId), any(BusinessRequestModel.class))).thenReturn(responseModel);

        ResponseEntity<BusinessResponseModel> response = businessController.updateBusinessById(mockJwt, businessId, requestModel);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(businessId, response.getBody().getBusinessId());
        verify(businessService, times(1)).updateBusinessById(any(Jwt.class), eq(businessId), any(BusinessRequestModel.class));
    }

    @Test
    void updateBusinessById_WhenNotFound_ShouldThrowException() {
        when(businessService.updateBusinessById(any(Jwt.class), eq(businessId), any(BusinessRequestModel.class)))
                .thenThrow(new RuntimeException("Business not found with id: " + businessId));

        assertThrows(RuntimeException.class, () -> businessController.updateBusinessById(mockJwt, businessId, requestModel));

        verify(businessService, times(1)).updateBusinessById(any(Jwt.class), eq(businessId), any(BusinessRequestModel.class));
    }
}
