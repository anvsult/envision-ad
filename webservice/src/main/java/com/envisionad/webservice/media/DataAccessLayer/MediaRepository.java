package com.envisionad.webservice.media.DataAccessLayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface MediaRepository extends JpaRepository<Media, String>, JpaSpecificationExecutor<Media>{
}
