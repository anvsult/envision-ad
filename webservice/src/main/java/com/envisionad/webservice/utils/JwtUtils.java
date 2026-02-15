package com.envisionad.webservice.utils;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.business.dataaccesslayer.EmployeeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Component
public class JwtUtils {

    private final EmployeeRepository employeeRepository;

    public JwtUtils(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public String extractUserId(Jwt jwt) {
        String userId = jwt.getSubject();
        if (userId == null || userId.isEmpty()) {
            throw new AccessDeniedException("Invalid token");
        }
        return userId;
    }

    public void validateUserIsEmployeeOfBusiness(String userId, String businessId) {
        boolean isEmployee = employeeRepository.existsByUserIdAndBusinessId_BusinessId(userId, businessId);
        if (!isEmployee)
            throw new AccessDeniedException("Access Denied");
    }

    public void validateUserIsEmployeeOfBusiness(Jwt jwt, String businessId) {
        String userId = extractUserId(jwt);
        boolean isEmployee = employeeRepository.existsByUserIdAndBusinessId_BusinessId(userId, businessId);
        if (!isEmployee)
            throw new AccessDeniedException("Access Denied");
    }

    public void validateBusinessOwnsCampaign(String businessId, AdCampaign campaign) {
        String campaignBusinessId = campaign.getBusinessId().getBusinessId();
        if (!campaignBusinessId.equals(businessId)) {
            throw new AccessDeniedException("Campaign does not belong to the specified business");
        }
    }

    public boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;

        return authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .anyMatch(a ->
                        a.equals(authority) ||
                                a.equals("SCOPE_" + authority)
                );
    }
}


