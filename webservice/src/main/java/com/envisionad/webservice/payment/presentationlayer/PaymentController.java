package com.envisionad.webservice.payment.presentationlayer;

import com.envisionad.webservice.payment.businesslogiclayer.StripeServiceImpl;
import com.envisionad.webservice.payment.presentationlayer.models.PaymentIntentRequestModel;
import com.envisionad.webservice.utils.JwtUtils;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = {"http://localhost:3000", "https://envision-ad.ca"})
public class PaymentController {
    private final StripeServiceImpl stripeService;
    private final JwtUtils jwtUtils;

    public PaymentController(StripeServiceImpl stripeService, JwtUtils jwtUtils) {
        this.stripeService = stripeService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/connect-account")
    public ResponseEntity<Map<String, String>> createConnectedAccount(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) throws StripeException {

        String businessId = body.get("businessId");
        jwtUtils.validateUserIsEmployeeOfBusiness(jwtUtils.extractUserId(jwt), businessId);

        String accountId = stripeService.createConnectedAccount(businessId);

        String accountLink = stripeService.createAccountLink(
                accountId,
                body.get("returnUrl"),
                body.get("refreshUrl")
        );

        return ResponseEntity.ok(Map.of(
                "accountId", accountId,
                "onboardingUrl", accountLink
        ));
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody PaymentIntentRequestModel request) throws StripeException {

        Map<String, String> result = stripeService.createCheckoutSession(
                request.getReservationId(),
                request.getAmount(),
                request.getBusinessId()
        );

        return ResponseEntity.ok(result);
    }

    @GetMapping("/account-status")
    public ResponseEntity<Map<String, Object>> getAccountStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String businessId) {

        jwtUtils.validateUserIsEmployeeOfBusiness(jwtUtils.extractUserId(jwt), businessId);

        Map<String, Object> status = stripeService.getAccountStatus(businessId);
        return ResponseEntity.ok(status);
    }
}
