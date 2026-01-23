package com.envisionad.webservice.payment.businesslogiclayer;

import com.envisionad.webservice.payment.dataaccesslayer.*;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class StripeServiceImpl implements StripeService {
    private final StripeAccountRepository stripeAccountRepository;
    private final PaymentIntentRepository paymentIntentRepository;

    @Value("${stripe.platform-fee-percent}")
    private int platformFeePercent;

    public StripeServiceImpl(StripeAccountRepository stripeAccountRepository,
                             PaymentIntentRepository paymentIntentRepository) {
        this.stripeAccountRepository = stripeAccountRepository;
        this.paymentIntentRepository = paymentIntentRepository;
    }

    @Transactional
    public String createConnectedAccount(String businessId) throws StripeException {
        // Check if account already exists
        return stripeAccountRepository.findByBusinessId(businessId)
                .map(StripeAccount::getStripeAccountId)
                .orElseGet(() -> {
                    try {
                        AccountCreateParams params = AccountCreateParams.builder()
                                .setType(AccountCreateParams.Type.EXPRESS)
                                .setCapabilities(
                                        AccountCreateParams.Capabilities.builder()
                                                .setCardPayments(
                                                        AccountCreateParams.Capabilities.CardPayments.builder()
                                                                .setRequested(true)
                                                                .build()
                                                )
                                                .setTransfers(
                                                        AccountCreateParams.Capabilities.Transfers.builder()
                                                                .setRequested(true)
                                                                .build()
                                                )
                                                .build()
                                )
                                .build();

                        Account account = Account.create(params);

                        StripeAccount stripeAccount = new StripeAccount();
                        stripeAccount.setBusinessId(businessId);
                        stripeAccount.setStripeAccountId(account.getId());
                        stripeAccount.setOnboardingComplete(false);
                        stripeAccountRepository.save(stripeAccount);

                        return account.getId();
                    } catch (StripeException e) {
                        throw new RuntimeException("Failed to create Stripe account", e);
                    }
                });
    }

    public String createAccountLink(String stripeAccountId, String returnUrl, String refreshUrl) throws StripeException {
        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(stripeAccountId)
                .setRefreshUrl(refreshUrl)
                .setReturnUrl(returnUrl)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();

        AccountLink accountLink = AccountLink.create(params);
        return accountLink.getUrl();
    }

    @Transactional
    public Map<String, String> createPaymentIntent(String reservationId, BigDecimal amount,
                                                   String connectedAccountId) throws StripeException {
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        long platformFee = (amountInCents * platformFeePercent) / 100;

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setApplicationFeeAmount(platformFee)
                .setTransferData(
                        PaymentIntentCreateParams.TransferData.builder()
                                .setDestination(connectedAccountId)
                                .build()
                )
                .putMetadata("reservationId", reservationId)
                .build();

        com.stripe.model.PaymentIntent stripeIntent = com.stripe.model.PaymentIntent.create(params);

        // Save to database
        PaymentIntent paymentIntent = new PaymentIntent();
        paymentIntent.setStripePaymentIntentId(stripeIntent.getId());
        paymentIntent.setReservationId(reservationId);
        paymentIntent.setAmount(amount);
        paymentIntent.setStatus(PaymentStatus.PENDING);
        paymentIntent.setCreatedAt(LocalDateTime.now());
        paymentIntentRepository.save(paymentIntent);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", stripeIntent.getClientSecret());
        response.put("paymentIntentId", stripeIntent.getId());
        return response;
    }

    @Transactional
    public Map<String, String> createPaymentIntentForBusiness(String reservationId, BigDecimal amount,
                                                              String businessId) throws StripeException {
        // Fetch Stripe account for the business
        StripeAccount stripeAccount = stripeAccountRepository.findByBusinessId(businessId)
                .orElseThrow(() -> new RuntimeException("Business has not connected a Stripe account"));

        if (!stripeAccount.isOnboardingComplete()) {
            throw new RuntimeException("Business has not completed Stripe onboarding");
        }

        return createPaymentIntent(reservationId, amount, stripeAccount.getStripeAccountId());
    }

    @Transactional
    public void updateAccountStatus(String stripeAccountId) throws StripeException {
        Account account = Account.retrieve(stripeAccountId);

        stripeAccountRepository.findByStripeAccountId(stripeAccountId)
                .ifPresent(stripeAccount -> {
                    stripeAccount.setChargesEnabled(account.getChargesEnabled());
                    stripeAccount.setPayoutsEnabled(account.getPayoutsEnabled());
                    stripeAccount.setOnboardingComplete(
                            account.getChargesEnabled() && account.getPayoutsEnabled()
                    );
                    stripeAccountRepository.save(stripeAccount);
                });
    }

    /**
     * Get Stripe account status for a business
     */
    public Map<String, Object> getAccountStatus(String businessId) {
        Map<String, Object> status = new HashMap<>();

        Optional<StripeAccount> accountOpt = stripeAccountRepository.findByBusinessId(businessId);

        if (accountOpt.isEmpty()) {
            status.put("connected", false);
            status.put("onboardingComplete", false);
            status.put("chargesEnabled", false);
            status.put("payoutsEnabled", false);
        } else {
            StripeAccount account = accountOpt.get();
            status.put("connected", true);
            status.put("onboardingComplete", account.isOnboardingComplete());
            status.put("chargesEnabled", account.isChargesEnabled());
            status.put("payoutsEnabled", account.isPayoutsEnabled());
            status.put("stripeAccountId", account.getStripeAccountId());
        }

        return status;
    }

    @Transactional
    @Override
    public Map<String, String> createCheckoutSession(String reservationId, BigDecimal amount, String businessId) throws StripeException {
        // Fetch Stripe account for the business
        StripeAccount stripeAccount = stripeAccountRepository.findByBusinessId(businessId)
                .orElseThrow(() -> new RuntimeException("Business has not connected a Stripe account"));

        if (!stripeAccount.isOnboardingComplete()) {
            throw new RuntimeException("Business has not completed Stripe onboarding");
        }

        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        long platformFee = (amountInCents * platformFeePercent) / 100;

        // Create Checkout Session
        com.stripe.param.checkout.SessionCreateParams params =
            com.stripe.param.checkout.SessionCreateParams.builder()
                .setMode(com.stripe.param.checkout.SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true")
                .setCancelUrl("http://localhost:3000/dashboard?canceled=true")
                .addLineItem(
                    com.stripe.param.checkout.SessionCreateParams.LineItem.builder()
                        .setPriceData(
                            com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(amountInCents)
                                .setProductData(
                                    com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Media Reservation")
                                        .setDescription("Reservation ID: " + reservationId)
                                        .build()
                                )
                                .build()
                        )
                        .setQuantity(1L)
                        .build()
                )
                .setPaymentIntentData(
                    com.stripe.param.checkout.SessionCreateParams.PaymentIntentData.builder()
                        .setApplicationFeeAmount(platformFee)
                        .setTransferData(
                            com.stripe.param.checkout.SessionCreateParams.PaymentIntentData.TransferData.builder()
                                .setDestination(stripeAccount.getStripeAccountId())
                                .build()
                        )
                        .putMetadata("reservationId", reservationId)
                        .build()
                )
                .build();

        com.stripe.model.checkout.Session session = com.stripe.model.checkout.Session.create(params);

        // Save payment intent info to database
        PaymentIntent paymentIntent = new PaymentIntent();
        String stripePaymentIntentId = session.getPaymentIntent();
        if (stripePaymentIntentId != null) {
            paymentIntent.setStripePaymentIntentId(stripePaymentIntentId);
        }
        paymentIntent.setReservationId(reservationId);
        paymentIntent.setAmount(amount);
        paymentIntent.setStatus(PaymentStatus.PENDING);
        paymentIntent.setCreatedAt(LocalDateTime.now());
        paymentIntentRepository.save(paymentIntent);

        Map<String, String> response = new HashMap<>();
        response.put("sessionUrl", session.getUrl());
        response.put("sessionId", session.getId());
        return response;
    }
}
