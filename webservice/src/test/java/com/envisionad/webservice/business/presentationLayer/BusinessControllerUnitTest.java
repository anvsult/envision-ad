package com.envisionad.webservice.business.presentationLayer;

import com.envisionad.webservice.business.businessLogicLayer.BusinessService;
import com.envisionad.webservice.business.dataAccessLayer.Address;
import com.envisionad.webservice.business.dataAccessLayer.Business;
import com.envisionad.webservice.business.dataAccessLayer.CompanySize;
import com.envisionad.webservice.business.mappingLayer.BusinessResponseMapper;
import com.envisionad.webservice.business.presentationLayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationLayer.models.BusinessResponseModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BusinessController.class)
class BusinessControllerUnitTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BusinessService businessService;

    @MockitoBean
    private BusinessResponseMapper businessResponseMapper;

    @Autowired
    private ObjectMapper objectMapper;

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
    void createBusiness_ShouldReturnCreatedBusiness() throws Exception {
        given(businessResponseMapper.requestModelToEntity(any(BusinessRequestModel.class))).willReturn(business);
        given(businessService.createBusiness(any(Business.class))).willReturn(business);
        given(businessResponseMapper.entityToResponseModel(any(Business.class))).willReturn(responseModel);

        mockMvc.perform(post("/api/v1/businesses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(businessId.toString()))
                .andExpect(jsonPath("$.name").value("Test Business"));
    }

    @Test
    void getAllBusinesses_ShouldReturnListOfBusinesses() throws Exception {
        List<Business> businessList = Arrays.asList(business);

        given(businessService.getAllBusinesses()).willReturn(businessList);
        given(businessResponseMapper.entityToResponseModel(any(Business.class))).willReturn(responseModel);

        mockMvc.perform(get("/api/v1/businesses"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(businessId.toString()))
                .andExpect(jsonPath("$[0].name").value("Test Business"));
    }

    @Test
    void getBusinessById_WhenFound_ShouldReturnBusiness() throws Exception {
        given(businessService.getBusinessById(businessId)).willReturn(business);
        given(businessResponseMapper.entityToResponseModel(business)).willReturn(responseModel);

        mockMvc.perform(get("/api/v1/businesses/{id}", businessId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(businessId.toString()));
    }
}