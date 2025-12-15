package com.envisionad.webservice.business.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Integer> {
    Invitation findByInvitationId_InvitationId(String invitationId);
    List<Invitation> findAllByBusinessId_BusinessId(String businessId);
    Invitation findByToken(String code);
}
