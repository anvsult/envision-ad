package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Invitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Embedded
    private InvitationIdentifier invitationId;

    private BusinessIdentifier businessId;

    @Email
    @NotNull
    private String email;

    private String token;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timeCreated;

    private LocalDateTime timeExpires;
}
