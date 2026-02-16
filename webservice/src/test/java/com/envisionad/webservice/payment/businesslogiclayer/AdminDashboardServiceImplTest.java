package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.payment.dataaccesslayer.AdminDashboardRepository;
import com.envisionad.webservice.payment.presentationlayer.models.AdminOverviewResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceImplTest {

    @Mock
    private AdminDashboardRepository adminDashboardRepository;

    @InjectMocks
    private AdminDashboardServiceImpl adminDashboardService;

    @Test
    void getOverview_mapsAllFieldsCorrectly() {
        when(adminDashboardRepository.sumPlatformRevenue()).thenReturn(new BigDecimal("1234.56"));
        when(adminDashboardRepository.countOrganizations()).thenReturn(10L);
        when(adminDashboardRepository.countMediaListings()).thenReturn(50L);
        when(adminDashboardRepository.countDistinctKnownUsers()).thenReturn(200L);
        when(adminDashboardRepository.countMediaOwners()).thenReturn(80L);
        when(adminDashboardRepository.countAdvertisers()).thenReturn(120L);

        AdminOverviewResponse res = adminDashboardService.getOverview();

        assertThat(res).isNotNull();

        assertThat(res.totalPlatformRevenue()).isEqualByComparingTo("1234.56");
        assertThat(res.totalOrganizations()).isEqualTo(10L);
        assertThat(res.totalMediaListings()).isEqualTo(50L);
        assertThat(res.totalUsers()).isEqualTo(200L);
        assertThat(res.totalMediaOwners()).isEqualTo(80L);
        assertThat(res.totalAdvertisers()).isEqualTo(120L);

        verify(adminDashboardRepository).sumPlatformRevenue();
        verify(adminDashboardRepository).countOrganizations();
        verify(adminDashboardRepository).countMediaListings();
        verify(adminDashboardRepository).countDistinctKnownUsers();
        verify(adminDashboardRepository).countMediaOwners();
        verify(adminDashboardRepository).countAdvertisers();
        verifyNoMoreInteractions(adminDashboardRepository);
    }

    @Test
    void getOverview_handlesZeros() {
        when(adminDashboardRepository.sumPlatformRevenue()).thenReturn(BigDecimal.ZERO);
        when(adminDashboardRepository.countOrganizations()).thenReturn(0L);
        when(adminDashboardRepository.countMediaListings()).thenReturn(0L);
        when(adminDashboardRepository.countDistinctKnownUsers()).thenReturn(0L);
        when(adminDashboardRepository.countMediaOwners()).thenReturn(0L);
        when(adminDashboardRepository.countAdvertisers()).thenReturn(0L);

        AdminOverviewResponse res = adminDashboardService.getOverview();

        assertThat(res).isNotNull();
        assertThat(res.totalPlatformRevenue()).isEqualByComparingTo("0");
        assertThat(res.totalOrganizations()).isZero();
        assertThat(res.totalMediaListings()).isZero();
        assertThat(res.totalUsers()).isZero();
        assertThat(res.totalMediaOwners()).isZero();
        assertThat(res.totalAdvertisers()).isZero();
    }


    @Test
    void getOverview_mapsAllRepositoryValues() {
        AdminDashboardRepository repo = mock(AdminDashboardRepository.class);

        when(repo.sumPlatformRevenue()).thenReturn(new BigDecimal("123.45"));
        when(repo.countOrganizations()).thenReturn(10L);
        when(repo.countMediaListings()).thenReturn(20L);
        when(repo.countDistinctKnownUsers()).thenReturn(30L);
        when(repo.countMediaOwners()).thenReturn(40L);
        when(repo.countAdvertisers()).thenReturn(50L);

        AdminDashboardServiceImpl service = new AdminDashboardServiceImpl(repo);

        AdminOverviewResponse res = service.getOverview();

        assertEquals(new BigDecimal("123.45"), res.totalPlatformRevenue());
        assertEquals(10L, res.totalOrganizations());
        assertEquals(20L, res.totalMediaListings());
        assertEquals(30L, res.totalUsers());
        assertEquals(40L, res.totalMediaOwners());
        assertEquals(50L, res.totalAdvertisers());

        verify(repo).sumPlatformRevenue();
        verify(repo).countOrganizations();
        verify(repo).countMediaListings();
        verify(repo).countDistinctKnownUsers();
        verify(repo).countMediaOwners();
        verify(repo).countAdvertisers();
        verifyNoMoreInteractions(repo);
    }
}
