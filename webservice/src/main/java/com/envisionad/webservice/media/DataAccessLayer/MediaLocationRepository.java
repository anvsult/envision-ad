package com.envisionad.webservice.media.DataAccessLayer;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaLocationRepository extends JpaRepository<MediaLocation, UUID> {
    @EntityGraph(attributePaths = "mediaList")
    List<MediaLocation> findAllByBusinessId(UUID businessId);

    @Override
    @EntityGraph(attributePaths = "mediaList")
    Optional<MediaLocation> findById(UUID id);
}
