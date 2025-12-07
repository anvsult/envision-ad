package com.envisionad.webservice.Media.PresentationLayer.Models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class WeeklyScheduleEntry {
    private String dayOfWeek;
    private boolean isActive;
    private String startTime;
    private String endTime;
}
