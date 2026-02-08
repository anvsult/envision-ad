package com.envisionad.webservice.media.DataAccessLayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaLocationRepository extends JpaRepository<MediaLocation, UUID> {
    List<MediaLocation> findAllByBusinessId(UUID businessId);
}