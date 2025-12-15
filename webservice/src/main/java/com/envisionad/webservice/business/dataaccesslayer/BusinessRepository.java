package com.envisionad.webservice.business.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessRepository extends JpaRepository<Business, String> {
    Business findByBusinessId_BusinessId(String businessId);
    boolean existsByName(String name);
    boolean existsByBusinessId_BusinessId(String businessId);
}