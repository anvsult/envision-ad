package com.envisionad.webservice.business.presentationlayer;

import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.dataaccesslayer.CompanySize;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class BusinessControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        businessRepository.deleteAll();
    }

    @Test
    void createBusiness_ShouldPersistAndReturnBusiness() throws Exception {
        BusinessRequestModel requestModel = new BusinessRequestModel();
        requestModel.setName("Integration Business");
        requestModel.setCompanySize(CompanySize.MEDIUM);
        requestModel.setStreet("Integration St");
        requestModel.setCity("Integration City");
        requestModel.setState("State");
        requestModel.setZipCode("00000");
        requestModel.setCountry("Country");

        mockMvc.perform(post("/api/v1/businesses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Integration Business")))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.address.street", is("Integration St")));

        assertEquals(1, businessRepository.count());
    }

    @Test
    void getAllBusinesses_ShouldReturnAllBusinesses() throws Exception {
        createAndSaveBusiness("Business 1");
        createAndSaveBusiness("Business 2");

        mockMvc.perform(get("/api/v1/businesses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void getBusinessById_ShouldReturnOneBusiness() throws Exception {
        Business savedBusiness = createAndSaveBusiness("Target Business");

        mockMvc.perform(get("/api/v1/businesses/{id}", savedBusiness.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedBusiness.getId().toString())))
                .andExpect(jsonPath("$.name", is("Target Business")));
    }

    @Test
    void updateBusinessById_ShouldUpdateAndReturnBusiness() throws Exception {
        Business savedBusiness = createAndSaveBusiness("Original Business");

        BusinessRequestModel updateModel = new BusinessRequestModel();
        updateModel.setName("Updated Business");
        updateModel.setCompanySize(CompanySize.LARGE);
        updateModel.setStreet("Updated St");
        updateModel.setCity("Updated City");
        updateModel.setState("Updated State");
        updateModel.setZipCode("11111");
        updateModel.setCountry("Updated Country");

        mockMvc.perform(put("/api/v1/businesses/{id}", savedBusiness.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedBusiness.getId().toString())))
                .andExpect(jsonPath("$.name", is("Updated Business")))
                .andExpect(jsonPath("$.companySize", is("LARGE")))
                .andExpect(jsonPath("$.address.street", is("Updated St")))
                .andExpect(jsonPath("$.address.city", is("Updated City")));

        assertEquals(1, businessRepository.count());
    }

    @Test
    void deleteBusinessById_ShouldDeleteAndReturnBusiness() throws Exception {
        Business savedBusiness = createAndSaveBusiness("Business to Delete");
        UUID businessId = savedBusiness.getId();

        mockMvc.perform(delete("/api/v1/businesses/{id}", businessId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(businessId.toString())))
                .andExpect(jsonPath("$.name", is("Business to Delete")));

        assertEquals(0, businessRepository.count());
        assertFalse(businessRepository.findById(businessId).isPresent());
    }

    private Business createAndSaveBusiness(String name) {
        Address address = new Address("Street", "City", "State", "Zip", "Country");
        Business business = new Business();
        business.setName(name);
        business.setCompanySize(CompanySize.SMALL);
        business.setAddress(address);
        return businessRepository.save(business);
    }
}
