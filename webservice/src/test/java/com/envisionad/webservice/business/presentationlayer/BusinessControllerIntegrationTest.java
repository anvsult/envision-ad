package com.envisionad.webservice.business.presentationlayer;

import com.envisionad.webservice.business.dataaccesslayer.*;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.InvitationRequestModel;
import com.envisionad.webservice.utils.EmailService;
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

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties  = {"spring.datasource.url=jdbc:h2:mem:user-db"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class BusinessControllerIntegrationTest {

    private final String BASE_URI_BUSINESSES = "/api/v1/businesses";

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private EmailService emailService;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @BeforeEach
    void setUp() {
        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|6934e8515479d2b6d3cf7575")
                .claim("scope", "read write")
                .claim("permissions", List.of(
                        "create:employee",
                        "create:media",
                        "delete:employee",
                        "read:employee",
                        "update:business",
                        "update:media",
                        "create:business",
                        "readAll:business",
                        "read:business"
                ))
                .build();

        Jwt jwt2 = Jwt.withTokenValue("mock-token2")
                .header("alg", "none")
                .claim("sub", "auth0|6934e8515479d2b6d3cf7576")
                .claim("scope", "read write")
                .claim("permissions", List.of(
                        "create:employee",
                        "create:media",
                        "delete:employee",
                        "read:employee",
                        "update:business",
                        "update:media",
                        "create:business",
                        "readAll:business",
                        "read:business"
                ))
                .build();

        when(jwtDecoder.decode("mock-token")).thenReturn(jwt);
        when(jwtDecoder.decode("mock-token2")).thenReturn(jwt2);
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

        Address address = new Address();
        address.setStreet("Integration St");
        address.setCity("Integration City");
        address.setState("State");
        address.setZipCode("00000");
        address.setCountry("Country");
        requestModel.setAddress(address);

        Roles roles = new Roles();
        roles.setAdvertiser(true);
        roles.setMediaOwner(true);
        requestModel.setRoles(roles);

        // Act & Assert
        webTestClient.post()
                .uri(BASE_URI_BUSINESSES)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token2"))
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
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11";

        // Arrange
        BusinessRequestModel requestModel = new BusinessRequestModel();
        requestModel.setName("Integration Business");
        requestModel.setCompanySize(CompanySize.LARGE);

        Address address = new Address();
        address.setStreet("Integration St");
        address.setCity("Integration City");
        address.setState("State");
        address.setZipCode("00000");
        address.setCountry("Country");
        requestModel.setAddress(address);

        Roles roles = new Roles();
        roles.setAdvertiser(true);
        roles.setMediaOwner(true);
        requestModel.setRoles(roles);

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

    @Test
    void getAllBusinessInvitations_ShouldReturnAllInvitations() {
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11";
        long initialInvitationCount = invitationRepository.findAllByBusinessId_BusinessId(businessId).size();

        webTestClient.get()
                .uri(BASE_URI_BUSINESSES + "/{businessId}/invites", businessId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.length()").isEqualTo(initialInvitationCount);
    }

    @Test
    void createInvitation_ShouldPersistAndReturnInvitation() {
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11";
        long initialInvitationCount = invitationRepository.count();

        InvitationRequestModel invitationRequest = new InvitationRequestModel();
        invitationRequest.setEmail("newemployee@test.com");

        webTestClient.post()
                .uri(BASE_URI_BUSINESSES + "/{businessId}/invites", businessId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(invitationRequest))
                .exchange()
                .expectStatus().isCreated()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.email").isEqualTo("newemployee@test.com")
                .jsonPath("$.invitationId").isNotEmpty();

        assertEquals(initialInvitationCount + 1, invitationRepository.count());
        verify(emailService, times(1)).sendSimpleEmail(anyString(), anyString(), anyString());
    }

    @Test
    void cancelInvitation_ShouldRemoveInvitation() {
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11";

        // First create an invitation
        InvitationRequestModel invitationRequest = new InvitationRequestModel();
        invitationRequest.setEmail("todelete@test.com");

        webTestClient.post()
                .uri(BASE_URI_BUSINESSES + "/{businessId}/invites", businessId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(invitationRequest))
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.invitationId").isNotEmpty()
                .jsonPath("$.email").isEqualTo("todelete@test.com");

        long countBeforeDelete = invitationRepository.count();

        // Get the invitation ID from the repository
        Invitation invitation = invitationRepository.findAll().stream()
                .filter(inv -> inv.getEmail().equals("todelete@test.com"))
                .findFirst()
                .orElseThrow();

        // Now delete it
        webTestClient.delete()
                .uri(BASE_URI_BUSINESSES + "/{businessId}/invites/{invitationId}",
                        businessId, invitation.getInvitationId().getInvitationId())
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isNoContent();

        assertEquals(countBeforeDelete - 1, invitationRepository.count());
    }

    @Test
    void getAllBusinessEmployees_ShouldReturnAllEmployees() {
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11";
        long employeeCount = employeeRepository.findAllByBusinessId_BusinessId(businessId).size();

        webTestClient.get()
                .uri(BASE_URI_BUSINESSES + "/{businessId}/employees", businessId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.length()").isEqualTo(employeeCount);
    }

    @Test
    void addEmployeeToBusiness_WithValidToken_ShouldAddEmployee() {
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11";

        // Create an invitation first
        InvitationRequestModel invitationRequest = new InvitationRequestModel();
        invitationRequest.setEmail("newemployee@test.com");

        webTestClient.post()
                .uri(BASE_URI_BUSINESSES + "/{businessId}/invites", businessId)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .body(BodyInserters.fromValue(invitationRequest))
                .exchange()
                .expectStatus().isCreated();

        // Get the token
        Invitation invitation = invitationRepository.findAll().stream()
                .filter(inv -> inv.getEmail().equals("newemployee@test.com"))
                .findFirst()
                .orElseThrow();

        String token = invitation.getToken();
        long employeeCountBefore = employeeRepository.count();

        // Add employee using token
        webTestClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path(BASE_URI_BUSINESSES + "/{businessId}/employees")
                        .queryParam("token", token)
                        .build(businessId))
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token2"))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.employeeId").isNotEmpty();

        assertEquals(employeeCountBefore + 1, employeeRepository.count());
    }

    @Test
    void removeEmployeeFromBusiness_ShouldRemoveEmployee() {
        String businessId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11";

        // Get an existing employee
        List<Employee> employees = employeeRepository.findAllByBusinessId_BusinessId(businessId);
        assertFalse(employees.isEmpty(), "Should have at least one employee");

        Employee employeeToRemove = employees.getFirst();
        String employeeId = employeeToRemove.getEmployeeId().getEmployeeId();
        long employeeCountBefore = employeeRepository.count();

        webTestClient.delete()
                .uri(BASE_URI_BUSINESSES + "/{businessId}/employees/{employeeId}",
                        businessId, employeeId)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isNoContent();

        assertEquals(employeeCountBefore - 1, employeeRepository.count());
    }

    @Test
    void getBusinessByUserId_ShouldReturnBusiness() {
        String userId = "auth0|6934e8515479d2b6d3cf7575";

        webTestClient.get()
                .uri(BASE_URI_BUSINESSES + "/employee/{userId}", userId)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth("mock-token"))
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.businessId").isNotEmpty()
                .jsonPath("$.name").isNotEmpty();
    }
}
