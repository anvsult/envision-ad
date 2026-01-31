package com.envisionad.webservice.payment.dataaccesslayer;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "stripe_accounts")
@Data
public class StripeAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String businessId;

    @Column(unique = true, nullable = false)
    private String stripeAccountId;

    private boolean onboardingComplete;

    private boolean chargesEnabled;

    private boolean payoutsEnabled;
}
