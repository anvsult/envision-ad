package com.envisionad.webservice.media.util;

import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaRequestModel;
import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class MediaRequestValidatorTest {

    private MediaRequestValidator validator;
    private MediaRequestModel validModel;

    @BeforeEach
    void setUp() {
        validator = new MediaRequestValidator();
        validModel = new MediaRequestModel();
        validModel.setTitle("Valid Title");
        validModel.setMediaOwnerName("Owner");
        validModel.setAddress("123 Street");
        validModel.setPrice(new BigDecimal("100.00"));
        validModel.setDailyImpressions(1000);
        validModel.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        validModel.setLoopDuration(10);

        ScheduleModel schedule = new ScheduleModel();
        schedule.setSelectedMonths(Collections.singletonList("JANUARY"));

        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setActive(true);
        entry.setStartTime("08:00");
        entry.setEndTime("17:00");
        schedule.setWeeklySchedule(Collections.singletonList(entry));

        validModel.setSchedule(schedule);
    }

    @Test
    void validate_ValidModel_NoException() {
        assertDoesNotThrow(() -> validator.validate(validModel));
    }

    @Test
    void validate_NullModel_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> validator.validate(null));
    }

    @Test
    void validate_TitleTooLong_ThrowsException() {
        validModel.setTitle("A".repeat(53));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }

    @Test
    void validate_NullPrice_ThrowsException() {
        validModel.setPrice(null);
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }

    @Test
    void validate_NegativePrice_ThrowsException() {
        validModel.setPrice(new BigDecimal("-1.00"));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }

    @Test
    void validate_NullImpressions_ThrowsException() {
        validModel.setDailyImpressions(null);
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }

    @Test
    void validate_NegativeImpressions_ThrowsException() {
        validModel.setDailyImpressions(-1);
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }

    @Test
    void validate_ScheduleNoActiveDays_ThrowsException() {
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setActive(false);
        validModel.getSchedule().setWeeklySchedule(Collections.singletonList(entry));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }

    @Test
    void validate_ScheduleInvalidTimeOrder_ThrowsException() {
        WeeklyScheduleEntry entry = validModel.getSchedule().getWeeklySchedule().get(0);
        entry.setStartTime("18:00");
        entry.setEndTime("08:00");
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }

    @Test
    void validate_ScheduleMissingTime_ThrowsException() {
        WeeklyScheduleEntry entry = validModel.getSchedule().getWeeklySchedule().get(0);
        entry.setStartTime(null);
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }

    @Test
    void validate_ScheduleInvalidFormat_ThrowsException() {
        WeeklyScheduleEntry entry = validModel.getSchedule().getWeeklySchedule().get(0);
        entry.setStartTime("25:00"); // Invalid hour
        assertThrows(IllegalArgumentException.class, () -> validator.validate(validModel));
    }
}
