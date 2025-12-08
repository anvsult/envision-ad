package com.envisionad.webservice.business.dataAccessLayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, UUID> {

    boolean existsByName(String name);
}