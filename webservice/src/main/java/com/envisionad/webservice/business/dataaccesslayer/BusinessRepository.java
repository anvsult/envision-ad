package com.envisionad.webservice.business.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, String> {
    Business findByBusinessId_BusinessId(String businessId);
    Business findByEmployeeIdsContains(String employeeId);
    boolean existsByName(String name);
}