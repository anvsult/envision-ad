package com.envisionad.webservice.Media.DataAccessLayer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.sql.Types;

@Entity
@Data
@NoArgsConstructor
@Table(name = "media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "media_id")
    private String id;

    @Column(name = "title")
    private String title;

    @Column(name = "media_owner_name")
    private String mediaOwnerName;

    @Column(name = "address")
    private String address;

    @Column(name = "type_of_display")
    @Enumerated(EnumType.STRING)
    private TypeOfDisplay typeOfDisplay;

    @Column(name = "loop_duration")
    private Integer loopDuration;

    @Column(name = "resolution")
    private String resolution;

    @Column(name = "aspect_ratio")
    private String aspectRatio;

    @Column(name = "width")
    private Double width;

    @Column(name = "height")
    private Double height;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "daily_impressions")
    private Integer dailyImpressions;

    @Column(name = "schedule")
    @JdbcTypeCode(SqlTypes.JSON)
    private String schedule;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "image_file_name")
    private String imageFileName;

    @Column(name = "image_content_type")
    private String imageContentType;

    @Lob
    @JdbcTypeCode(Types.BINARY)
    @Column(name = "image_data")
    private byte[] imageData;
}