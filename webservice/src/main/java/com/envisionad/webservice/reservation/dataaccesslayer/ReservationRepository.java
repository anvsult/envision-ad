package com.envisionad.webservice.reservation.dataaccesslayer;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    List<Reservation> findAllReservationsByMediaId(UUID mediaId);

    @Query("SELECT r FROM Reservation r WHERE r.mediaId = :mediaId " +
           "AND r.status = 'CONFIRMED' " +
           "AND r.startDate < :endDate " +
           "AND r.endDate > :startDate")
    List<Reservation> findAllActiveReservationsByMediaIdAndDateRange(
            @Param("mediaId") UUID mediaId,
            @Param("startDate") @NotNull LocalDateTime startDate,
            @Param("endDate") @NotNull LocalDateTime endDate
    );

    Optional<Reservation> findByReservationId(String reservationId);
}
