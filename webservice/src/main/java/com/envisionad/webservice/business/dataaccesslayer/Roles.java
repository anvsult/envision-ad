package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class Roles {
    @Column(name = "media_owner")
    private boolean isMediaOwner;

    @Column(name = "advertiser")
    private boolean isAdvertiser;
}
