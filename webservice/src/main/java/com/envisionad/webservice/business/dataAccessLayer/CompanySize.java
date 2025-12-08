package com.envisionad.webservice.business.dataAccessLayer;

import lombok.Getter;

@Getter
public enum CompanySize {
    SMALL("1 - 50"),
    MEDIUM("51 - 150"),
    LARGE("151 - 500"),
    ENTERPRISE("500+");

    private final String label;

    CompanySize(String label) {
        this.label = label;
    }

}
