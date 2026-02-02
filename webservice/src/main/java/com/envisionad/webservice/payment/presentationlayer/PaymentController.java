package com.envisionad.webservice.payment.presentationlayer;

import com.envisionad.webservice.payment.businesslogiclayer.StripeService;
import com.envisionad.webservice.payment.presentationlayer.models.PaymentIntentRequestModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = { "http://localhost:3000", "https://envision-ad.ca" })
public class PaymentController {
    private final StripeService stripeService;

    public PaymentController(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping("/connect-account")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> createConnectedAccount(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) throws Exception {

        String businessId = body.get("businessId");
        String returnUrl = body.get("returnUrl");
        String refreshUrl = body.get("refreshUrl");

        // Delegate creation and onboarding link generation to the service layer
        Map<String, String> resp = stripeService.createConnectedAccountAndLink(jwt, businessId, returnUrl, refreshUrl);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/create-payment-intent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody PaymentIntentRequestModel request) throws Exception {

        Map<String, String> result = stripeService.createAuthorizedCheckoutSession(
                jwt,
                request.getCampaignId(),
                request.getMediaId(),
                request.getReservationId(),
                request.getStartDate(),
                request.getEndDate());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDashboardData(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String businessId,
            @RequestParam String period) throws Exception {

        return ResponseEntity.ok(stripeService.getDashboardData(jwt, businessId, period));
    }

    @GetMapping("/account-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getAccountStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String businessId) {

        Map<String, Object> status = stripeService.getAccountStatus(jwt, businessId);
        return ResponseEntity.ok(status);
    }

}
