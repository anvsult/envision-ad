package com.envisionad.webservice.business.dataaccesslayer;

import lombok.Getter;

@Getter
public enum OrganizationSize {
    SMALL("1 - 50"),
    MEDIUM("51 - 150"),
    LARGE("151 - 500"),
    ENTERPRISE("500+");

    private final String label;

    OrganizationSize(String label) {
        this.label = label;
    }

}
