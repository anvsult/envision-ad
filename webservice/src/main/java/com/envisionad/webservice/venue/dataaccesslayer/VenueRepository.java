package com.envisionad.webservice.venue.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VenueRepository extends JpaRepository<Venue, Integer> {

    Optional<Venue> findByVenueId(String venueId);

    List<Venue> findAllByOrderByNameEnAsc();

    List<Venue> findAllByOrderByNameFrAsc();
}
