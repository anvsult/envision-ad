package com.envisionad.webservice.payment.dataaccesslayer;

import java.math.BigDecimal;

public interface AdminDashboardRepository {
    long countOrganizations();
    long countMediaListings();
    BigDecimal sumPlatformRevenue();
    long countDistinctKnownUsers();
    long countMediaOwners();
    long countAdvertisers();
}
