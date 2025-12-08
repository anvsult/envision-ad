package com.envisionad.webservice.media.PresentationLayer.Models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ScheduleModel {
    private List<String> selectedMonths;
    private List<WeeklyScheduleEntry> weeklySchedule;
}
