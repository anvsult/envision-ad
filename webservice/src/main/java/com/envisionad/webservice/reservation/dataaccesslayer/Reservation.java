package com.envisionad.webservice.reservation.dataaccesslayer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String reservationId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    @Embedded
    private DenialDetails denialDetails;

    private BigDecimal totalPrice;

    private String advertiserId;

    private String campaignId;

    private UUID mediaId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}