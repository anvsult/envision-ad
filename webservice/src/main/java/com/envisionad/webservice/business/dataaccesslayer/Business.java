package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_address")
    private String companyAddress;

    @Column(name = "employee_num")
    private String employeeNum;

    @Column(name = "company_size ")
    private CompanySize companySize;



}
