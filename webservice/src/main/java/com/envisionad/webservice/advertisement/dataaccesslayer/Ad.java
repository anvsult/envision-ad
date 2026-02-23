package com.envisionad.webservice.advertisement.dataaccesslayer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;



@Entity
@Data
@NoArgsConstructor
@Table(name="ads")
public class Ad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Embedded
    private AdIdentifier adIdentifier;

    @Column(name = "name")
    private String name;

    @Column(name = "ad_url")
    private String adUrl;

    @Column(name = "ad_type")
    @Enumerated(EnumType.STRING)
    private AdType adType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ad_campaign_ref_id", nullable = false)
    @ToString.Exclude // prevents infinite loops in Lombok-generated toString methods
    private AdCampaign campaign;

}
