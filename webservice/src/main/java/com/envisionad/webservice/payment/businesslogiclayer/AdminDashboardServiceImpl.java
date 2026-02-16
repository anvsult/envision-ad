package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.payment.dataaccesslayer.AdminDashboardRepository;
import com.envisionad.webservice.payment.presentationlayer.models.AdminOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final AdminDashboardRepository repo;

    @Override
    public AdminOverviewResponse getOverview() {
        return new AdminOverviewResponse(
                repo.sumPlatformRevenue(),
                repo.countOrganizations(),
                repo.countMediaListings(),
                repo.countDistinctKnownUsers(),
                repo.countMediaOwners(),
                repo.countAdvertisers()
        );
    }
}
