package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private BusinessIdentifier businessId;

    private String name;

    private String ownerId;

    @Enumerated(EnumType.STRING)
    private CompanySize companySize;

    // TODO - Remove Address Class from business subdomain, and convert it into just a String.
    //  Separate fields for country, province, city, etc. will still be entered separately in the front-end,
    //  but just concatenated into an address string once sent to the backend
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @Embedded
    private Roles roles;

    @ElementCollection
    @CollectionTable(
            name = "business_employees",
            joinColumns = @JoinColumn(name = "business_id")
    )
    @Column(name = "employee_id")
    private Set<String> employeeIds = new HashSet<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreated;
}
