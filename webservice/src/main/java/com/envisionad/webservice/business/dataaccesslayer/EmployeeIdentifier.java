package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Embeddable
@AllArgsConstructor
public class EmployeeIdentifier {
    private String employeeId;

    public EmployeeIdentifier() {
        this.employeeId = java.util.UUID.randomUUID().toString();
    }
}
