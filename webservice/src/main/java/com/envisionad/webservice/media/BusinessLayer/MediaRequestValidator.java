package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

public class MediaRequestValidator {

    public static void validateMediaRequest(MediaRequestModel request) {
        if (request == null) {
            throw new IllegalArgumentException("Media request cannot be null");
        }

        validateTitle(request.getTitle());
        validatePrice(request.getPrice());
        validateDailyImpressions(request.getDailyImpressions());
        validateTypeOfDisplay(request);
        validateSchedule(request);
    }

    private static void validateTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        if (title.length() > 52) {
            throw new IllegalArgumentException("Title cannot exceed 52 characters");
        }
    }

    private static void validatePrice(BigDecimal price) {
        if (price == null) {
            throw new IllegalArgumentException("Price cannot be null");
        }
        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        if (price.scale() > 2) {
            throw new IllegalArgumentException("Price cannot have more than 2 decimal places");
        }
        if (price.compareTo(new BigDecimal("99999.99")) > 0) {
            throw new IllegalArgumentException("Price cannot exceed 99999.99");
        }
    }

    private static void validateDailyImpressions(Integer dailyImpressions) {
        if (dailyImpressions == null) {
            throw new IllegalArgumentException("Daily impressions cannot be null");
        }
        if (dailyImpressions < 0) {
            throw new IllegalArgumentException("Daily impressions cannot be negative");
        }
    }

    private static void validateTypeOfDisplay(MediaRequestModel request) {
        if (request.getTypeOfDisplay() == null) {
            throw new IllegalArgumentException("Type of display cannot be null");
        }

        if (request.getMediaOwnerName() != null && request.getMediaOwnerName().length() > 52) {
            throw new IllegalArgumentException("Media owner name cannot exceed 52 characters");
        }

        if (request.getTypeOfDisplay() == TypeOfDisplay.DIGITAL) {
            if (request.getLoopDuration() == null || request.getLoopDuration() <= 0) {
                throw new IllegalArgumentException(
                        "Loop duration is required and must be positive for Digital displays");
            }
            if (request.getResolution() == null || request.getResolution().trim().isEmpty()) {
                throw new IllegalArgumentException("Resolution is required for Digital displays");
            }
            if (request.getResolution().length() > 20) {
                throw new IllegalArgumentException("Resolution cannot exceed 20 characters");
            }
            if (request.getAspectRatio() == null || request.getAspectRatio().trim().isEmpty()) {
                throw new IllegalArgumentException("Aspect ratio is required for Digital displays");
            }
            if (request.getAspectRatio().length() > 10) {
                throw new IllegalArgumentException("Aspect ratio cannot exceed 10 characters");
            }
        } else if (request.getTypeOfDisplay() == TypeOfDisplay.POSTER) {
            if (request.getWidth() == null || request.getWidth() <= 0) {
                throw new IllegalArgumentException("Width is required and must be positive for Poster displays");
            }
            if (request.getHeight() == null || request.getHeight() <= 0) {
                throw new IllegalArgumentException("Height is required and must be positive for Poster displays");
            }
        }
    }

    private static void validateSchedule(MediaRequestModel request) {
        if (request.getSchedule() == null) {
            throw new IllegalArgumentException("Schedule cannot be null");
        }

        List<WeeklyScheduleEntry> weeklySchedule = request.getSchedule().getWeeklySchedule();
        if (weeklySchedule == null || weeklySchedule.isEmpty()) {
            throw new IllegalArgumentException("Weekly schedule cannot be empty");
        }

        boolean hasActiveDay = false;
        for (WeeklyScheduleEntry entry : weeklySchedule) {
            if (entry.isActive()) {
                hasActiveDay = true;
                validateTimeRange(entry.getStartTime(), entry.getEndTime());
            }
        }

        if (!hasActiveDay) {
            throw new IllegalArgumentException("Schedule must have at least one active day");
        }
    }

    private static void validateTimeRange(String startTime, String endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time must be provided for active days");
        }

        try {
            LocalTime start = LocalTime.parse(startTime);
            LocalTime end = LocalTime.parse(endTime);

            if (!end.isAfter(start)) {
                throw new IllegalArgumentException("End time must be after start time");
            }
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid time format. Use HH:mm");
        }
    }
}
