package com.envisionad.webservice.business.presentationlayer;

import com.envisionad.webservice.business.dataaccesslayer.*;
import com.envisionad.webservice.business.presentationlayer.models.AddressRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.RoleRequestModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.Arrays;
import java.util.UUID;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = { "spring.datasource.url=jdbc:h2:mem:user-db" })
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class BusinessControllerIntegrationTest {

    private final String BASE_URI_BUSINESSES = "/api/v1/businesses";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @BeforeEach
    void setUp() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|6934e8515479d2b6d3cf7575")
                .claim("scope", "openid profile email")
                .claim("permissions", Arrays.asList(

                        "create:employee",
                        "create:media",
                        "delete:employee",
                        "update:business",
                        "update:media",
                        "update:business",
                        "delete:employee",
                        "create:employee",
                        "readAll:business",
                        "read:business"
                ))
                .build();
        when(jwtDecoder.decode(anyString())).thenReturn(jwt);

    }

    @Test
    void getAllBusinesses_ShouldReturnAllBusinesses() {
        webTestClient.get()
                .uri(uriBuilder -> uriBuilder.path(BASE_URI_BUSINESSES)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange().expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody().jsonPath("$.length()").isEqualTo(5);
    }

    @Test
    void createBusiness_ShouldPersistAndReturnBusiness() {
        // Arrange
        BusinessRequestModel requestModel = new BusinessRequestModel();
        requestModel.setName("Integration Business");
        requestModel.setCompanySize(CompanySize.MEDIUM);

        AddressRequestModel addressRequestModel = new AddressRequestModel();
        addressRequestModel.setStreet("Integration St");
        addressRequestModel.setCity("Integration City");
        addressRequestModel.setState("State");
        addressRequestModel.setZipCode("00000");
        addressRequestModel.setCountry("Country");
        requestModel.setAddress(addressRequestModel);

        RoleRequestModel roleRequestModel = new RoleRequestModel();
        roleRequestModel.setAdvertiser(true);
        roleRequestModel.setMediaOwner(true);
        requestModel.setRoles(roleRequestModel);

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_BUSINESSES)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isCreated()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.name").isEqualTo("Integration Business")
                .jsonPath("$.companySize").isEqualTo("MEDIUM")
                .jsonPath("$.businessId").isNotEmpty()
                .jsonPath("$.address.street").isEqualTo("Integration St")
                .jsonPath("$.address.city").isEqualTo("Integration City");

        assertEquals(6, businessRepository.count());
    }

    @Test
    void getBusinessById_ShouldReturnOneBusiness() {
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11";

        webTestClient.get()
                .uri(BASE_URI_BUSINESSES + "/{businessId}", businessId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.businessId").isEqualTo(businessId)
                .jsonPath("$.name").isEqualTo("Mom & Pop Bakery")
                .jsonPath("$.companySize").isEqualTo("SMALL");
    }

    @Test
    void getBusinessById_WithInvalidId_ShouldReturnNotFound() {
        String invalidBusinessId = UUID.randomUUID().toString();

        webTestClient.get()
                .uri(BASE_URI_BUSINESSES + "/{businessId}", invalidBusinessId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void updateBusinessById_ShouldUpdateAndReturnBusiness() {
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22";

        // Arrange
        BusinessRequestModel requestModel = new BusinessRequestModel();
        requestModel.setName("Integration Business");
        requestModel.setCompanySize(CompanySize.LARGE);

        AddressRequestModel addressRequestModel = new AddressRequestModel();
        addressRequestModel.setStreet("Integration St");
        addressRequestModel.setCity("Integration City");
        addressRequestModel.setState("State");
        addressRequestModel.setZipCode("00000");
        addressRequestModel.setCountry("Country");
        requestModel.setAddress(addressRequestModel);

        RoleRequestModel roleRequestModel = new RoleRequestModel();
        roleRequestModel.setAdvertiser(true);
        roleRequestModel.setMediaOwner(true);
        requestModel.setRoles(roleRequestModel);

        // Add the test user to the business employees so they are authorized to update
        // it
        new TransactionTemplate(transactionManager).execute(status -> {
            com.envisionad.webservice.business.dataaccesslayer.Business business = businessRepository
                    .findByBusinessId_BusinessId(businessId);
            if (business != null) {
                business.getEmployeeIds().add("auth0|65702e81e9661e14ab3aac89");
                businessRepository.save(business);
            }
            return null;
        });

        // Act & Assert
        webTestClient.put()
                .uri(BASE_URI_BUSINESSES + "/{businessId}", businessId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(requestModel))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.businessId").isEqualTo(businessId)
                .jsonPath("$.name").isEqualTo("Integration Business")
                .jsonPath("$.companySize").isEqualTo("LARGE")
                .jsonPath("$.address.street").isEqualTo("Integration St")
                .jsonPath("$.address.city").isEqualTo("Integration City")
                .jsonPath("$.address.state").isEqualTo("State");

        assertEquals(5, businessRepository.count());
    }
}
