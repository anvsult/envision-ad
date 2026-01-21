package com.envisionad.webservice.payment.businesslogiclayer;

import com.stripe.exception.StripeException;
import java.math.BigDecimal;
import java.util.Map;

public interface StripeService {
    Map<String, String> createCheckoutSession(String reservationId, BigDecimal amount, String businessId) throws StripeException;
}
