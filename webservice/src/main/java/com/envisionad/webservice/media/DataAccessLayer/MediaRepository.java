package com.envisionad.webservice.media.DataAccessLayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID>, JpaSpecificationExecutor<Media>{
    List<Media> findMediaByBusinessId(UUID businessId);

    @Query("SELECT DISTINCT m FROM Media m LEFT JOIN FETCH m.mediaLocation WHERE m.id IN :mediaIds")
    List<Media> findAllByIdWithLocation(@Param("mediaIds") List<UUID> mediaIds);
}
