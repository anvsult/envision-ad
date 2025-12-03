package com.envisionad.webservice.Media.DataAccessLayer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@Table(name = "media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "media_id")
    private String id;

    @Column(name = "media_owner_name")
    private String mediaOwnerName;

    @Column(name = "title")
    private String title;

    @Column(name = "resolution")
    private String resolution; // Must be String to store "1920x1080"

    @Column(name = "type_of_display")
    @Enumerated(EnumType.STRING)
    private TypeOfDisplay typeOfDisplay;

    @Column(name = "aspect_ratio")
    private String aspectRatio;

    @Column(name = "address")
    private String address;

    @Column(name = "schedule")
    private String schedule;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status;
}