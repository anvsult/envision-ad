package com.envisionad.webservice.media.DataAccessLayer;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "media_location")
public class MediaLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "media_location_id")
    private UUID id;

    @OneToMany(mappedBy = "mediaLocation", cascade = CascadeType.ALL)
    private List<Media> mediaList = new ArrayList<>();

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String province;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false,
            name = "postal_code")
    private String postalCode;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

}

