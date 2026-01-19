package com.envisionad.webservice.advertisement.dataaccesslayer;

import com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "ad_campaigns")
public class AdCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Embedded
    private AdCampaignIdentifier campaignId;

    @Embedded
    private BusinessIdentifier businessId;

    private String name;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // this prevents infinite loops with Lombok
    private List<Ad> ads = new ArrayList<>();

}
