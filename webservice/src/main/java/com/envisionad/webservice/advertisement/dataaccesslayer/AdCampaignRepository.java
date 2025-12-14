package com.envisionad.webservice.advertisement.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdCampaignRepository extends JpaRepository<AdCampaign, Integer> {
    AdCampaign findByCampaignId_CampaignId(String campaignId);

}
