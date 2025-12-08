package com.envisionad.webservice.Media.PresentationLayer.Models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class WeeklyScheduleEntry {
    private String dayOfWeek;
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean active;
    private String startTime;
    private String endTime;
}
