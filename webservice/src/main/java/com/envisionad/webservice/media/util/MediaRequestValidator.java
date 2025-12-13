package com.envisionad.webservice.media.util;

import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class MediaRequestValidator {

    public void validate(MediaRequestModel model) {
        if (model == null) {
            throw new IllegalArgumentException("Request model cannot be null");
        }

        if (model.getTitle() == null || model.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        if (model.getTitle().length() > 52) {
            throw new IllegalArgumentException("Title cannot exceed 52 characters");
        }
        if (model.getMediaOwnerName() == null || model.getMediaOwnerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Media Owner Name cannot be empty");
        }
        if (model.getAddress() == null || model.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Address cannot be empty");
        }

        // Price and Impressions are required
        if (model.getPrice() == null) {
            throw new IllegalArgumentException("Price is required");
        }
        if (model.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }

        if (model.getDailyImpressions() == null) {
            throw new IllegalArgumentException("Daily Impressions are required");
        }
        if (model.getDailyImpressions() < 0) {
            throw new IllegalArgumentException("Daily Impressions cannot be negative");
        }

        // Conditional Validation based on TypeOfDisplay
        if (model.getTypeOfDisplay() != null) {
            switch (model.getTypeOfDisplay()) {
                case DIGITAL:
                    if (model.getLoopDuration() == null) {
                        throw new IllegalArgumentException("Loop Duration is required for Digital displays");
                    }
                    if (model.getLoopDuration() < 0) {
                        throw new IllegalArgumentException("Loop Duration cannot be negative");
                    }
                    break;
                case POSTER:
                    if (model.getWidth() == null || model.getHeight() == null) {
                        throw new IllegalArgumentException("Width and Height are required for Poster displays");
                    }
                    if (model.getWidth() < 0) {
                        throw new IllegalArgumentException("Width cannot be negative");
                    }
                    if (model.getHeight() < 0) {
                        throw new IllegalArgumentException("Height cannot be negative");
                    }
                    break;
            }
        }

        // Schedule Validation
        if (model.getSchedule() != null) {
            if (model.getSchedule().getSelectedMonths() == null || model.getSchedule().getSelectedMonths().isEmpty()) {
                throw new IllegalArgumentException("At least one month must be selected");
            }

            if (model.getSchedule().getWeeklySchedule() != null) {
                boolean hasActiveDay = false;
                for (com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry entry : model
                        .getSchedule().getWeeklySchedule()) {
                    if (entry.isActive()) {
                        hasActiveDay = true;
                        if (entry.getStartTime() == null || entry.getStartTime().isEmpty()) {
                            throw new IllegalArgumentException("Start time is required for active duration");
                        }
                        if (entry.getEndTime() == null || entry.getEndTime().isEmpty()) {
                            throw new IllegalArgumentException("End time is required for active duration");
                        }
                        // Simple string comparison for HH:mm format, or better use LocalTime if format
                        // is guaranteed
                        // Assuming frontend sends standard format, strict parsing is better.
                        try {
                            java.time.LocalTime start = java.time.LocalTime.parse(entry.getStartTime());
                            java.time.LocalTime end = java.time.LocalTime.parse(entry.getEndTime());
                            if (!end.isAfter(start)) {
                                throw new IllegalArgumentException("End time must be after start time");
                            }
                        } catch (java.time.format.DateTimeParseException e) {
                            throw new IllegalArgumentException("Invalid time format");
                        }
                    }
                }
                if (!hasActiveDay) {
                    throw new IllegalArgumentException("At least one day must be active in the schedule");
                }
            }
        }
    }
}
