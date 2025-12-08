package com.envisionad.webservice.business.businesslogiclayer;

import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.dataaccesslayer.CompanySize;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessServiceImplTest {

    @Mock
    private BusinessRepository businessRepository;

    @InjectMocks
    private BusinessServiceImpl businessService;

    private Business business;
    private Address address;
    private final UUID businessId = UUID.randomUUID();
    private final String businessName = "Test Business";

    @BeforeEach
    void setUp() {
        address = new Address("123 Main St", "Springfield", "IL", "62701", "USA");
        address.setId(UUID.randomUUID());

        business = new Business();
        business.setId(businessId);
        business.setName(businessName);
        business.setCompanySize(CompanySize.MEDIUM);
        business.setAddress(address);
        business.setDateCreated(LocalDateTime.now());
    }

    @Test
    void createBusiness_WhenNameDoesNotExist_ShouldCreateSuccessfully() {
        // Given
        when(businessRepository.existsByName(businessName)).thenReturn(false);
        when(businessRepository.save(any(Business.class))).thenReturn(business);

        // When
        Business result = businessService.createBusiness(business);

        // Then
        assertNotNull(result);
        assertEquals(businessId, result.getId());
        assertEquals(businessName, result.getName());
        assertEquals(CompanySize.MEDIUM, result.getCompanySize());
        verify(businessRepository, times(1)).existsByName(businessName);
        verify(businessRepository, times(1)).save(business);
    }

    @Test
    void createBusiness_WhenNameAlreadyExists_ShouldThrowException() {
        // Given
        when(businessRepository.existsByName(businessName)).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            businessService.createBusiness(business);
        });

        assertEquals("Business with name " + businessName + " already exists", exception.getMessage());
        verify(businessRepository, times(1)).existsByName(businessName);
        verify(businessRepository, never()).save(any(Business.class));
    }

    @Test
    void getAllBusinesses_ShouldReturnListOfBusinesses() {
        // Given
        Business business2 = new Business();
        business2.setId(UUID.randomUUID());
        business2.setName("Another Business");
        business2.setCompanySize(CompanySize.SMALL);
        business2.setAddress(address);

        List<Business> expectedBusinesses = Arrays.asList(business, business2);
        when(businessRepository.findAll()).thenReturn(expectedBusinesses);

        // When
        List<Business> result = businessService.getAllBusinesses();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedBusinesses, result);
        verify(businessRepository, times(1)).findAll();
    }

    @Test
    void getAllBusinesses_WhenNoBusinesses_ShouldReturnEmptyList() {
        // Given
        when(businessRepository.findAll()).thenReturn(Arrays.asList());

        // When
        List<Business> result = businessService.getAllBusinesses();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(businessRepository, times(1)).findAll();
    }

    @Test
    void getBusinessById_WhenBusinessExists_ShouldReturnBusiness() {
        // Given
        when(businessRepository.findById(businessId)).thenReturn(Optional.of(business));

        // When
        Business result = businessService.getBusinessById(businessId);

        // Then
        assertNotNull(result);
        assertEquals(businessId, result.getId());
        assertEquals(businessName, result.getName());
        verify(businessRepository, times(1)).findById(businessId);
    }

    @Test
    void getBusinessById_WhenBusinessDoesNotExist_ShouldThrowException() {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        when(businessRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            businessService.getBusinessById(nonExistentId);
        });

        assertEquals("Business not found with id: " + nonExistentId, exception.getMessage());
        verify(businessRepository, times(1)).findById(nonExistentId);
    }
}
