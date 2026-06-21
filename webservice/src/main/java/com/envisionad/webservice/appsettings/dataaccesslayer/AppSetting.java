package com.envisionad.webservice.appsettings.dataaccesslayer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_settings")
@Data
@NoArgsConstructor
public class AppSetting {

    @Id
    @Column(name = "setting_key", nullable = false)
    private String key;

    @Column(name = "setting_value", nullable = false)
    private String value;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}
