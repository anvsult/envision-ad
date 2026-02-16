package com.envisionad.webservice.payment.presentationlayer;

import com.envisionad.webservice.config.ApplicationProperties;
import com.envisionad.webservice.config.AuthenticationErrorHandler;
import com.envisionad.webservice.config.SecurityConfig;
import com.envisionad.webservice.payment.businesslogiclayer.AdminDashboardService;
import com.envisionad.webservice.payment.presentationlayer.models.AdminOverviewResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.security.core.authority.AuthorityUtils.createAuthorityList;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(SecurityConfig.class)
@WebMvcTest(AdminDashboardController.class)
class AdminDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminDashboardService adminDashboardService;

    @MockitoBean
    private ApplicationProperties applicationProperties;

    @MockitoBean
    private AuthenticationErrorHandler authenticationErrorHandler;

    @Test
    void getOverview_returnsExpectedJson() throws Exception {
        AdminOverviewResponse response = new AdminOverviewResponse(
                new BigDecimal("999.99"),
                5L,
                10L,
                20L,
                8L,
                12L
        );

        when(adminDashboardService.getOverview()).thenReturn(response);

        mockMvc.perform(get("/api/v1/admin/dashboard/overview")
                        .with(jwt().authorities(createAuthorityList("patch:media_status")))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalPlatformRevenue").value(999.99))
                .andExpect(jsonPath("$.totalOrganizations").value(5))
                .andExpect(jsonPath("$.totalMediaListings").value(10))
                .andExpect(jsonPath("$.totalUsers").value(20))
                .andExpect(jsonPath("$.totalMediaOwners").value(8))
                .andExpect(jsonPath("$.totalAdvertisers").value(12));
    }

    @Test
    void getOverview_withoutPermission_returnsForbidden() throws Exception {

        mockMvc.perform(get("/api/v1/admin/dashboard/overview")
                        .with(jwt().authorities(createAuthorityList("some:other_permission")))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
        void getOverview_withoutAuthority_returns403() throws Exception {
            mockMvc.perform(get("/api/v1/admin/dashboard/overview"))
                    .andExpect(status().isForbidden());
    }

}

