package com.envisionad.webservice.payment.presentationlayer.models;

import java.math.BigDecimal;

public record AdminOverviewResponse(
        BigDecimal totalPlatformRevenue,
        long totalOrganizations,
        long totalMediaListings,
        long totalUsers,
        long totalMediaOwners,
        long totalAdvertisers
) {}

