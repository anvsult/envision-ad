package com.envisionad.webservice.business.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, String> {
    Verification findVerificationByVerificationId_VerificationId(String verificationIdVerificationId);
    List<Verification> findAllByStatus(VerificationStatus status);
    List<Verification> findAllByBusinessId_BusinessId(String businessId);
}
