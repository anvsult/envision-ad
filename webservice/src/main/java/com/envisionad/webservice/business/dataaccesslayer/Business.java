package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private BusinessIdentifier businessId;

    private String name;

    private String ownerId;

    @Enumerated(EnumType.STRING)
    private CompanySize companySize;

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
    @Column(name = "employee_Id")
    private Set<String> employeeIds = new HashSet<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreated;
}
