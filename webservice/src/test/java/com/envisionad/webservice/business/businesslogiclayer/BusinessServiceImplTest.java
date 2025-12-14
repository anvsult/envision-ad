package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.exceptions.BusinessEmployeeNotFoundException;
import com.envisionad.webservice.business.exceptions.BusinessNotFoundException;
import com.envisionad.webservice.business.exceptions.DuplicateBusinessEmployeeException;
import com.envisionad.webservice.business.mappinglayer.BusinessModelMapper;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessServiceImplTest {

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private BusinessModelMapper businessModelMapper;

    @InjectMocks
    private BusinessServiceImpl businessService;

    @Test
    void addBusinessEmployeeById_ShouldAddAndReturnBusiness() {
        // Arrange
        String businessId = "b1";
        String employeeId = "e1";
        Business business = new Business();
        business.setBusinessId(new BusinessIdentifier(businessId));
        business.setEmployeeIds(new HashSet<>());

        BusinessResponseModel responseModel = new BusinessResponseModel();
        responseModel.setBusinessId(businessId);

        when(businessRepository.findByBusinessId_BusinessId(businessId)).thenReturn(business);
        when(businessRepository.save(any(Business.class))).thenReturn(business);
        when(businessModelMapper.entityToResponseModel(business)).thenReturn(responseModel);

        // Act
        BusinessResponseModel result = businessService.addBusinessEmployeeById(businessId, employeeId);

        // Assert
        assertNotNull(result);
        assertEquals(businessId, result.getBusinessId());
        assertTrue(business.getEmployeeIds().contains(employeeId));
        verify(businessRepository).save(business);
    }

    @Test
    void addBusinessEmployeeById_WhenDuplicate_ShouldThrowException() {
        // Arrange
        String businessId = "b1";
        String employeeId = "e1";
        Business business = new Business();
        business.setBusinessId(new BusinessIdentifier(businessId));
        business.setEmployeeIds(new HashSet<>(Set.of(employeeId)));

        when(businessRepository.findByBusinessId_BusinessId(businessId)).thenReturn(business);

        // Act & Assert
        assertThrows(DuplicateBusinessEmployeeException.class,
                () -> businessService.addBusinessEmployeeById(businessId, employeeId));
    }

    @Test
    void removeBusinessEmployeeById_ShouldRemoveAndReturnBusiness() {
        // Arrange
        String businessId = "b1";
        String employeeId = "e1";
        String userId = "user1"; // The user performing the action (must be an employee)

        Business business = new Business();
        business.setBusinessId(new BusinessIdentifier(businessId));
        // User must be in employee list to authorize, and target employee must be in
        // list to delete
        business.setEmployeeIds(new HashSet<>(Set.of(userId, employeeId)));

        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaim("sub")).thenReturn(userId);

        BusinessResponseModel responseModel = new BusinessResponseModel();
        responseModel.setBusinessId(businessId);

        when(businessRepository.findByBusinessId_BusinessId(businessId)).thenReturn(business);
        when(businessRepository.save(any(Business.class))).thenReturn(business);
        when(businessModelMapper.entityToResponseModel(business)).thenReturn(responseModel);

        // Act
        BusinessResponseModel result = businessService.removeBusinessEmployeeById(jwt, businessId, employeeId);

        // Assert
        assertNotNull(result);
        assertFalse(business.getEmployeeIds().contains(employeeId));
        assertTrue(business.getEmployeeIds().contains(userId)); // The remover remains
        verify(businessRepository).save(business);
    }

    @Test
    void removeBusinessEmployeeById_WhenBusinessNotFound_ShouldThrowException() {
        // Arrange
        String businessId = "b1";
        String employeeId = "e1";
        Jwt jwt = mock(Jwt.class);

        when(businessRepository.findByBusinessId_BusinessId(businessId)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessNotFoundException.class,
                () -> businessService.removeBusinessEmployeeById(jwt, businessId, employeeId));
    }

    @Test
    void removeBusinessEmployeeById_WhenUnauthorized_ShouldThrowAccessDenied() {
        // Arrange
        String businessId = "b1";
        String employeeId = "e1";
        String userId = "user1"; // User performing action

        Business business = new Business();
        business.setBusinessId(new BusinessIdentifier(businessId));
        business.setEmployeeIds(new HashSet<>()); // User is NOT an employee

        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaim("sub")).thenReturn(userId);

        when(businessRepository.findByBusinessId_BusinessId(businessId)).thenReturn(business);

        // Act & Assert
        assertThrows(AccessDeniedException.class,
                () -> businessService.removeBusinessEmployeeById(jwt, businessId, employeeId));
    }

    @Test
    void removeBusinessEmployeeById_WhenEmployeeNotFound_ShouldThrowException() {
        // Arrange
        String businessId = "b1";
        String employeeId = "e1"; // Target employee to remove
        String userId = "user1"; // User performing action

        Business business = new Business();
        business.setBusinessId(new BusinessIdentifier(businessId));
        business.setEmployeeIds(new HashSet<>(Set.of(userId))); // User acts, but target e1 is not there

        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaim("sub")).thenReturn(userId);

        when(businessRepository.findByBusinessId_BusinessId(businessId)).thenReturn(business);

        // Act & Assert
        assertThrows(BusinessEmployeeNotFoundException.class,
                () -> businessService.removeBusinessEmployeeById(jwt, businessId, employeeId));
    }

    @Test
    void getBusinessByEmployeeId_ShouldReturnBusiness() {
        // Arrange
        String employeeId = "e1";
        Business business = new Business();
        business.setBusinessId(new BusinessIdentifier("b1"));

        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaim("sub")).thenReturn(employeeId); // User requesting their own business

        BusinessResponseModel responseModel = new BusinessResponseModel();
        responseModel.setBusinessId("b1");

        when(businessRepository.findByEmployeeIdsContains(employeeId)).thenReturn(business);
        when(businessModelMapper.entityToResponseModel(business)).thenReturn(responseModel);

        // Act
        BusinessResponseModel result = businessService.getBusinessByEmployeeId(jwt, employeeId);

        // Assert
        assertNotNull(result);
        assertEquals("b1", result.getBusinessId());
    }

    @Test
    void getBusinessByEmployeeId_WhenUnauthorized_ShouldThrowAccessDenied() {
        // Arrange
        String employeeId = "e1";
        String userId = "otherUser"; // User trying to get someone else's business info

        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaim("sub")).thenReturn(userId);

        // Act & Assert
        assertThrows(AccessDeniedException.class, () -> businessService.getBusinessByEmployeeId(jwt, employeeId));
    }

    @Test
    void getBusinessByEmployeeId_WhenBusinessNotFound_ShouldThrowException() {
        // Arrange
        String employeeId = "e1";

        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaim("sub")).thenReturn(employeeId);

        when(businessRepository.findByEmployeeIdsContains(employeeId)).thenReturn(null);

        // Act & Assert
        assertThrows(BusinessNotFoundException.class, () -> businessService.getBusinessByEmployeeId(jwt, employeeId));
    }
}
