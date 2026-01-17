package com.envisionad.webservice.media.DataAccessLayer;

import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.sql.Types;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@Table(name = "media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "media_id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_location_id", nullable = false)
    private MediaLocation mediaLocation;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "media_owner_name", nullable = false)
    private String mediaOwnerName;

    @Column(name = "type_of_display", nullable = false)
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
    private ScheduleModel schedule;

    @Column(name = "status", nullable = false)
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

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "business_id")
    private UUID businessId;
}