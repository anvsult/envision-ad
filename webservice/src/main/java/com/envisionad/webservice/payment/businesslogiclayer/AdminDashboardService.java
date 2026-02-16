package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.payment.presentationlayer.models.AdminOverviewResponse;

public interface AdminDashboardService {
    AdminOverviewResponse getOverview();
}
