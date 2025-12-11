package com.envisionad.webservice.business.dataaccesslayer;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
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

    // TODO - Remove Address Class from business subdomain, and convert it into just a String.
    //  Separate fields for country, province, city, etc. will still be entered separately in the front-end,
    //  but just concatenated into an address string once sent to the backend
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @CreationTimestamp
    @Column(nullable = false, updatable = false) // updatable=false ensures it never changes after creation
    private LocalDateTime dateCreated;
}
