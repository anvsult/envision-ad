package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignResponseMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdResponseMapper;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.business.dataaccesslayer.EmployeeRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.utils.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdCampaignServiceUnitTest {

    @InjectMocks
    private AdCampaignServiceImpl adCampaignService;

    @Mock
    private AdCampaignRepository adCampaignRepository;
    @Mock
    private AdCampaignRequestMapper adCampaignRequestMapper;
    @Mock
    private AdCampaignResponseMapper adCampaignResponseMapper;
    @Mock
    private AdRequestMapper adRequestMapper;
    @Mock
    private AdResponseMapper adResponseMapper;
    @Mock
    private BusinessRepository businessRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private JwtUtils jwtUtils;
    @Mock
    private ReservationRepository reservationRepository;

    @Test
    void getActiveCampaignCount_shouldReturnCount() {
        String businessId = "test-business-id";
        int expectedCount = 5;

        when(reservationRepository.countActiveCampaignsByAdvertiserId(eq(businessId), any(LocalDateTime.class)))
                .thenReturn(expectedCount);

        Integer result = adCampaignService.getActiveCampaignCount(businessId);

        assertEquals(expectedCount, result);
    }
}
