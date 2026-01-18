package com.envisionad.webservice.reservation.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    List<Reservation> findAllReservationsByMediaId(UUID mediaId);
}
