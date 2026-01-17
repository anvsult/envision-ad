package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Verification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private VerificationIdentifier verificationId;

    private BusinessIdentifier businessId;

    @Enumerated(EnumType.STRING)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(length = 512)
    private String comments;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreated;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime dateModified;
}
