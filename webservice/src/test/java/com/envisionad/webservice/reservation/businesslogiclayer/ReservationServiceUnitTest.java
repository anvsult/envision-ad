package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.business.businesslogiclayer.BusinessServiceImpl;
import com.envisionad.webservice.business.dataaccesslayer.*;
import com.envisionad.webservice.business.exceptions.*;
import com.envisionad.webservice.business.mappinglayer.BusinessMapper;
import com.envisionad.webservice.business.mappinglayer.EmployeeMapper;
import com.envisionad.webservice.business.mappinglayer.InvitationMapper;
import com.envisionad.webservice.business.mappinglayer.VerificationMapper;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.InvitationRequestModel;
import com.envisionad.webservice.utils.EmailService;
import com.envisionad.webservice.utils.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceUnitTest {
    @InjectMocks
    private BusinessServiceImpl businessService;

    @Mock
    private EmailService emailService;

    @Mock
    private BusinessMapper businessMapper;

    @Mock
    private EmployeeMapper employeeMapper;

    @Mock
    private InvitationMapper invitationMapper;

    @Mock
    private VerificationMapper verificationMapper;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private InvitationRepository invitationRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private VerificationRepository verificationRepository;

    @Mock
    private JwtUtils jwtUtils;

    private static final String BUSINESS_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22";
    private static final String NOT_FOUND_BUSINESS_ID = "5d4bd18a-e062-4dc8-9715-f02dea0b3f99";
    private static final String VERIFICATION_ID = "b3888155-81dd-44f2-9448-230b40558e71";
    private static final String INVITATION_ID = "1de946c2-926d-417f-b782-362070e3c73c";
    private static final String INVITATION_TOKEN = "c59e5919-3d3c-4bff-a831-c5c61d3c492a";
    private static final String TEST_EMAIL = "test@email.com";

    private Jwt adminToken;
    private Jwt mediaToken;
    private Jwt advertiserToken;
    private Jwt newUserToken;

    private Address testAddress;
    private Roles mediaOwnerRoles;

    @BeforeEach
    void setUp() {
        adminToken = createJwtToken("admin-token", "auth0|696a89377cfdb558ea4a4a61",
                List.of("readAll:verification", "update:verification"));

        mediaToken = createJwtToken("media-token", "auth0|696a89137cfdb558ea4a4a4a",
                List.of("create:media", "update:media", "update:business", "read:employee",
                        "create:employee", "delete:employee", "read:verification", "create:verification"));

        advertiserToken = createJwtToken("advertiser-token", "auth0|696a88eb347945897ef17093",
                List.of("read:campaign", "create:campaign", "update:campaign", "update:business",
                        "read:employee", "create:employee", "delete:employee", "read:verification", "create:verification"));

        newUserToken = createJwtToken("newUser-token", "auth0|696b10a00bba0a28c21d3829", List.of());

        testAddress = createTestAddress();
        mediaOwnerRoles = createMediaOwnerRoles();
    }

    private Jwt createJwtToken(String tokenValue, String userId, List<String> permissions) {
        return Jwt.withTokenValue(tokenValue)
                .header("alg", "none")
                .claim("sub", userId)
                .claim("scope", "read write")
                .claim("permissions", permissions)
                .build();
    }

    private Address createTestAddress() {
        return new Address("123 Main St", "Toronto", "ON", "M5H 1A1", "Canada");
    }

    private Roles createMediaOwnerRoles() {
        Roles roles = new Roles();
        roles.setMediaOwner(true);
        return roles;
    }
}