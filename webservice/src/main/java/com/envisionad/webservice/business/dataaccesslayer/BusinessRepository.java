package com.envisionad.webservice.business.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Integer> {
    Business findByBusinessId_BusinessId(String businessId);
    List<Business> findAllByBusinessId_BusinessIdIn(List<String> businessIds);
    boolean existsByNameAndBusinessId_BusinessIdNot(String Name, String businessId);
    boolean existsByBusinessId_BusinessId(String businessId);
}
