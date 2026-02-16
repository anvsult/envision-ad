package com.envisionad.webservice.payment.presentationlayer;

import com.envisionad.webservice.payment.businesslogiclayer.AdminDashboardService;
import com.envisionad.webservice.payment.presentationlayer.models.AdminOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "https://envision-ad.ca" })
public class AdminDashboardController {

    private final AdminDashboardService service;

    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('patch:media_status')")
    public AdminOverviewResponse getOverview() {
        return service.getOverview();
    }
}
