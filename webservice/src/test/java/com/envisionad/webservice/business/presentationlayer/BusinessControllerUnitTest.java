package com.envisionad.webservice.business.presentationlayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessService;
import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.CompanySize;
import com.envisionad.webservice.business.mappinglayer.BusinessResponseMapper;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.Arrays;
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
    private BusinessResponseMapper businessResponseMapper;

    @Autowired
    private BusinessController businessController;

    private Business business;
    private BusinessResponseModel responseModel;
    private BusinessRequestModel requestModel;
    private final UUID businessId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        Address address = new Address("123 Street", "City", "State", "12345", "Country");
        address.setId(UUID.randomUUID());

        business = new Business();
        business.setId(businessId);
        business.setName("Test Business");
        business.setCompanySize(CompanySize.SMALL);
        business.setAddress(address);
        business.setDateCreated(LocalDateTime.now());

        BusinessResponseModel.AddressResponseModel addressResponse = new BusinessResponseModel.AddressResponseModel();
        addressResponse.setId(address.getId());
        addressResponse.setStreet(address.getStreet());
        addressResponse.setCity(address.getCity());
        addressResponse.setState(address.getState());
        addressResponse.setZipCode(address.getZipCode());
        addressResponse.setCountry(address.getCountry());

        responseModel = new BusinessResponseModel();
        responseModel.setId(businessId);
        responseModel.setName("Test Business");
        responseModel.setCompanySize(CompanySize.SMALL);
        responseModel.setAddress(addressResponse);
        responseModel.setDateCreated(business.getDateCreated());

        requestModel = new BusinessRequestModel();
        requestModel.setName("Test Business");
        requestModel.setCompanySize(CompanySize.SMALL);
        requestModel.setStreet("123 Street");
        requestModel.setCity("City");
        requestModel.setState("State");
        requestModel.setZipCode("12345");
        requestModel.setCountry("Country");
    }

    @Test
    void createBusiness_ShouldReturnCreatedBusiness() {
        when(businessResponseMapper.requestModelToEntity(any(BusinessRequestModel.class))).thenReturn(business);
        when(businessService.createBusiness(any(Business.class))).thenReturn(business);
        when(businessResponseMapper.entityToResponseModel(any(Business.class))).thenReturn(responseModel);

        ResponseEntity<BusinessResponseModel> response = businessController.createBusiness(requestModel);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(businessId, response.getBody().getId());
        assertEquals("Test Business", response.getBody().getName());
        verify(businessResponseMapper, times(1)).requestModelToEntity(any(BusinessRequestModel.class));
        verify(businessService, times(1)).createBusiness(any(Business.class));
        verify(businessResponseMapper, times(1)).entityToResponseModel(any(Business.class));
    }

    @Test
    void getAllBusinesses_ShouldReturnListOfBusinesses() {
        List<Business> businessList = Arrays.asList(business);

        when(businessService.getAllBusinesses()).thenReturn(businessList);
        when(businessResponseMapper.entityToResponseModel(any(Business.class))).thenReturn(responseModel);

        ResponseEntity<List<BusinessResponseModel>> response = businessController.getAllBusinesses();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(businessId, response.getBody().get(0).getId());
        assertEquals("Test Business", response.getBody().get(0).getName());
        verify(businessService, times(1)).getAllBusinesses();
        verify(businessResponseMapper, times(1)).entityToResponseModel(any(Business.class));
    }

    @Test
    void getBusinessById_WhenFound_ShouldReturnBusiness() {
        when(businessService.getBusinessById(businessId)).thenReturn(business);
        when(businessResponseMapper.entityToResponseModel(business)).thenReturn(responseModel);

        ResponseEntity<BusinessResponseModel> response = businessController.getBusinessById(businessId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(businessId, response.getBody().getId());
        verify(businessService, times(1)).getBusinessById(businessId);
        verify(businessResponseMapper, times(1)).entityToResponseModel(business);
    }

    @Test
    void updateBusinessById_ShouldReturnUpdatedBusiness() {
        when(businessResponseMapper.requestModelToEntity(any(BusinessRequestModel.class))).thenReturn(business);
        when(businessService.updateBusinessById(eq(businessId), any(Business.class))).thenReturn(business);
        when(businessResponseMapper.entityToResponseModel(any(Business.class))).thenReturn(responseModel);

        ResponseEntity<BusinessResponseModel> response = businessController.updateBusinessById(businessId, requestModel);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(businessId, response.getBody().getId());
        verify(businessResponseMapper, times(1)).requestModelToEntity(any(BusinessRequestModel.class));
        verify(businessService, times(1)).updateBusinessById(eq(businessId), any(Business.class));
        verify(businessResponseMapper, times(1)).entityToResponseModel(any(Business.class));
    }

    @Test
    void updateBusinessById_WhenNotFound_ShouldThrowException() {
        when(businessResponseMapper.requestModelToEntity(any(BusinessRequestModel.class))).thenReturn(business);
        when(businessService.updateBusinessById(eq(businessId), any(Business.class)))
                .thenThrow(new RuntimeException("Business not found with id: " + businessId));

        assertThrows(RuntimeException.class, () -> businessController.updateBusinessById(businessId, requestModel));

        verify(businessResponseMapper, times(1)).requestModelToEntity(any(BusinessRequestModel.class));
        verify(businessService, times(1)).updateBusinessById(eq(businessId), any(Business.class));
    }

    @Test
    void deleteBusinessById_ShouldReturnDeletedBusiness() {
        when(businessService.deleteBusinessById(businessId)).thenReturn(business);
        when(businessResponseMapper.entityToResponseModel(business)).thenReturn(responseModel);

        ResponseEntity<BusinessResponseModel> response = businessController.deleteBusinessById(businessId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(businessId, response.getBody().getId());
        assertEquals("Test Business", response.getBody().getName());
        verify(businessService, times(1)).deleteBusinessById(businessId);
        verify(businessResponseMapper, times(1)).entityToResponseModel(business);
    }

    @Test
    void deleteBusinessById_WhenNotFound_ShouldThrowException() {
        when(businessService.deleteBusinessById(businessId))
                .thenThrow(new RuntimeException("Business not found with id: " + businessId));

        assertThrows(RuntimeException.class, () -> businessController.deleteBusinessById(businessId));

        verify(businessService, times(1)).deleteBusinessById(businessId);
    }
}
