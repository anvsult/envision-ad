package com.envisionad.webservice.venue.dataaccesslayer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "venue")
@Data
@NoArgsConstructor
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "venue_id", unique = true, nullable = false)
    private String venueId;

    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;

    @Column(name = "name_fr", nullable = false, length = 100)
    private String nameFr;

    @Column(name = "color_code", nullable = false, length = 7)
    private String colorCode;

    @PrePersist
    private void generateVenueId() {
        if (this.venueId == null) {
            this.venueId = java.util.UUID.randomUUID().toString();
        }
    }
}
