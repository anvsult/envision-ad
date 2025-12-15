package com.envisionad.webservice.reservation.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    List<Reservation> findByAdvertiserId(String currentAdvertiserId);
}
