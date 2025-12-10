package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanySize companySize;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @CreationTimestamp
    @Column(nullable = false, updatable = false) // updatable=false ensures it never changes after creation
    private LocalDateTime dateCreated;

    @ElementCollection
    @CollectionTable(
            name = "business_employees",
            joinColumns = @JoinColumn(name = "business_id")
    )
    @Column(name = "employee_Id")
    private Set<String> employeeIds = new HashSet<>();
}
