package com.envisionad.webservice.payment.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StripeAccountRepository extends JpaRepository<StripeAccount, Long> {
    Optional<StripeAccount> findByBusinessId(String businessId);
    Optional<StripeAccount> findByStripeAccountId(String stripeAccountId);
}
