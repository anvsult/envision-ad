package com.envisionad.webservice.media.PresentationLayer.Models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class WeeklyScheduleEntry {
    private String dayOfWeek;
    @JsonProperty("isActive")
    private boolean active;
    private String startTime;
    private String endTime;
}
