package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MediaRequestValidatorTest {

    private MediaRequestModel request;

    @BeforeEach
    void setUp() {
        request = new MediaRequestModel();
        // Set default valid values to ensure other checks don't fail before the one we
        // are testing
        request.setTitle("Valid Title");
        request.setMediaLocationId("valid-location-id");
        request.setPrice(new BigDecimal("100.00"));
        request.setDailyImpressions(1000);
        request.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        request.setLoopDuration(10);
        request.setResolution("1920x1080");
        request.setAspectRatio("16:9");
        request.setImageUrl("http://example.com/image.jpg");
        request.setPreviewConfiguration("{\"corners\": []}");

        ScheduleModel schedule = new ScheduleModel();
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("09:00");
        entry.setEndTime("17:00");
        schedule.setWeeklySchedule(List.of(entry));
        request.setSchedule(schedule);
    }

    // --- Title Tests ---

    @Test
    void validateMediaRequest_TitleIsNull_ShouldThrowException() {
        request.setTitle(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Title cannot be empty", exception.getMessage());
    }

    @Test
    void validateMediaRequest_TitleIsEmpty_ShouldThrowException() {
        request.setTitle("");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Title cannot be empty", exception.getMessage());
    }

    @Test
    void validateMediaRequest_TitleIsBlank_ShouldThrowException() {
        request.setTitle("   ");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Title cannot be empty", exception.getMessage());
    }

    @Test
    void validateMediaRequest_TitleTooLong_ShouldThrowException() {
        request.setTitle("A".repeat(53));
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Title cannot exceed 52 characters", exception.getMessage());
    }

    // --- Price Tests ---

    @Test
    void validateMediaRequest_PriceIsNull_ShouldThrowException() {
        request.setPrice(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Price cannot be null", exception.getMessage());
    }

    @Test
    void validateMediaRequest_PriceIsNegative_ShouldThrowException() {
        request.setPrice(new BigDecimal("-1.00"));
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Price cannot be negative", exception.getMessage());
    }

    @Test
    void validateMediaRequest_PriceHasMoreThanTwoDecimalPlaces_ShouldThrowException() {
        request.setPrice(new BigDecimal("10.123"));
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Price cannot have more than 2 decimal places", exception.getMessage());
    }

    // --- Daily Impressions Tests ---

    @Test
    void validateMediaRequest_DailyImpressionsIsNull_ShouldThrowException() {
        request.setDailyImpressions(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Daily impressions cannot be null", exception.getMessage());
    }

    @Test
    void validateMediaRequest_DailyImpressionsIsNegative_ShouldThrowException() {
        request.setDailyImpressions(-1);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Daily impressions cannot be negative", exception.getMessage());
    }

    // --- TypeOfDisplay Tests ---

    @Test
    void validateMediaRequest_TypeOfDisplayIsNull_ShouldThrowException() {
        request.setTypeOfDisplay(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Type of display cannot be null", exception.getMessage());
    }

    // --- Digital Display Tests ---

    @Test
    void validateMediaRequest_Digital_LoopDurationIsNull_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        request.setLoopDuration(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Loop duration is required and must be positive for Digital displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Digital_LoopDurationIsZero_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        request.setLoopDuration(0);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Loop duration is required and must be positive for Digital displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Digital_ResolutionIsNull_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        request.setResolution(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Resolution is required for Digital displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Digital_ResolutionIsEmpty_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        request.setResolution("");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Resolution is required for Digital displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Digital_AspectRatioIsNull_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        request.setAspectRatio(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Aspect ratio is required for Digital displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Digital_AspectRatioIsEmpty_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        request.setAspectRatio("");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Aspect ratio is required for Digital displays", exception.getMessage());
    }

    // --- Poster Display Tests ---

    @Test
    void validateMediaRequest_Poster_WidthIsNull_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.POSTER);
        request.setWidth(null);
        // Ensure other poster fields are valid to isolate this check if needed,
        // but validator fails fast, so order matters. Width is checked first for
        // Poster.
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Width is required and must be positive for Poster displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Poster_WidthIsZero_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.POSTER);
        request.setWidth(0.0);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Width is required and must be positive for Poster displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Poster_WidthTooLarge_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.POSTER);
        request.setWidth(100000.0);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Width must be 99999 or less", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Poster_HeightIsNull_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.POSTER);
        request.setWidth(100.0); // valid width
        request.setHeight(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Height is required and must be positive for Poster displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Poster_HeightIsZero_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.POSTER);
        request.setWidth(100.0);
        request.setHeight(0.0);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Height is required and must be positive for Poster displays", exception.getMessage());
    }

    @Test
    void validateMediaRequest_Poster_HeightTooLarge_ShouldThrowException() {
        request.setTypeOfDisplay(TypeOfDisplay.POSTER);
        request.setWidth(100.0);
        request.setHeight(100000.0);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Height must be 99999 or less", exception.getMessage());
    }

    // --- Schedule Tests ---

    @Test
    void validateMediaRequest_ScheduleIsNull_ShouldThrowException() {
        request.setSchedule(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Schedule cannot be null", exception.getMessage());
    }

    @Test
    void validateMediaRequest_WeeklyScheduleIsNull_ShouldThrowException() {
        request.getSchedule().setWeeklySchedule(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Weekly schedule cannot be empty", exception.getMessage());
    }

    @Test
    void validateMediaRequest_WeeklyScheduleIsEmpty_ShouldThrowException() {
        request.getSchedule().setWeeklySchedule(List.of());
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Weekly schedule cannot be empty", exception.getMessage());
    }

    @Test
    void validateMediaRequest_ScheduleNoActiveDays_ShouldThrowException() {
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(false);
        request.getSchedule().setWeeklySchedule(List.of(entry));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Schedule must have at least one active day", exception.getMessage());
    }

    @Test
    void validateMediaRequest_ScheduleActiveDayMissingStartTime_ShouldThrowException() {
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime(null);
        entry.setEndTime("17:00");
        request.getSchedule().setWeeklySchedule(List.of(entry));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Start time and end time must be provided for active days", exception.getMessage());
    }

    @Test
    void validateMediaRequest_ScheduleActiveDayMissingEndTime_ShouldThrowException() {
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("09:00");
        entry.setEndTime(null);
        request.getSchedule().setWeeklySchedule(List.of(entry));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Start time and end time must be provided for active days", exception.getMessage());
    }

    @Test
    void validateMediaRequest_ScheduleActiveDayEndTimeBeforeStartTime_ShouldThrowException() {
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("17:00");
        entry.setEndTime("09:00");
        request.getSchedule().setWeeklySchedule(List.of(entry));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("End time must be after start time", exception.getMessage());
    }

    @Test
    void validateMediaRequest_ScheduleActiveDayInvalidTimeFormat_ShouldThrowException() {
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("nine o'clock");
        entry.setEndTime("17:00");
        request.getSchedule().setWeeklySchedule(List.of(entry));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Invalid time format. Use HH:mm", exception.getMessage());
    }

    // --- Image and Configuration Tests ---

    @Test
    void validateMediaRequest_ImageIsNull_ShouldThrowException() {
        request.setImageUrl(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Image is required", exception.getMessage());
    }

    @Test
    void validateMediaRequest_ImageIsEmpty_ShouldThrowException() {
        request.setImageUrl("");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Image is required", exception.getMessage());
    }

    @Test
    void validateMediaRequest_PreviewConfigIsNull_ShouldThrowException() {
        request.setPreviewConfiguration(null);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Preview configuration (corners) is required when an image is uploaded", exception.getMessage());
    }

    @Test
    void validateMediaRequest_PreviewConfigIsEmpty_ShouldThrowException() {
        request.setPreviewConfiguration("  ");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Preview configuration (corners) is required when an image is uploaded", exception.getMessage());
    }

    @Test
    void validateMediaRequest_ImageUrlIsInvalid_ShouldThrowException() {
        request.setImageUrl("invalid-url");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Image URL must be a valid URL", exception.getMessage());
    }

    @Test
    void validateMediaRequest_PreviewConfigurationIsInvalidJson_ShouldThrowException() {
        request.setPreviewConfiguration("{corners: invalid}");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> MediaRequestValidator.validateMediaRequest(request));
        assertEquals("Preview configuration must be valid JSON", exception.getMessage());
    }

    @Test
    void validateMediaRequest_ImageUrlAndConfigsAreValid_ShouldPass() {
        // These are already set in setUp() but verifying explicit valid values pass
        request.setImageUrl("https://example.com/image.png");
        request.setPreviewConfiguration("{\"corners\": [{\"x\": 10, \"y\": 10}]}");
        MediaRequestValidator.validateMediaRequest(request);
    }
}
