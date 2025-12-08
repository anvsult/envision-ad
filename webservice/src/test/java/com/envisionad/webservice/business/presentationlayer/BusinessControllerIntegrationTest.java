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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

        mockMvc.perform(post("/api/v1/business")
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

        mockMvc.perform(get("/api/v1/business"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void getBusinessById_ShouldReturnOneBusiness() throws Exception {
        Business savedBusiness = createAndSaveBusiness("Target Business");

        mockMvc.perform(get("/api/v1/business/{id}", savedBusiness.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedBusiness.getId().toString())))
                .andExpect(jsonPath("$.name", is("Target Business")));
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
