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
        if (model.getMediaOwnerName() == null || model.getMediaOwnerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Media Owner Name cannot be empty");
        }
        if (model.getAddress() == null || model.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Address cannot be empty");
        }
        if (model.getPrice() != null && model.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        if (model.getDailyImpressions() != null && model.getDailyImpressions() < 0) {
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
        }
    }
}
