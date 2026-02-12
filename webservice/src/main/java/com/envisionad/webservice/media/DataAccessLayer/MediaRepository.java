package com.envisionad.webservice.media.DataAccessLayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID>, JpaSpecificationExecutor<Media>{
    List<Media> findMediaByBusinessId(UUID businessId);
}
