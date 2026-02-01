package com.envisionad.webservice.reservation.utils;

import com.envisionad.webservice.reservation.exceptions.BadReservationRequestException;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;

import java.time.LocalDate;

public class ReservationValidator {
    public static void validateReservation(ReservationRequestModel requestModel, String mediaId) {
        if (requestModel == null || !validateStartDate(requestModel) || !validateEndDate(requestModel) || !validateMediaId(mediaId) || !validateCampaignId(requestModel))
            throw new BadReservationRequestException();
    }

    /**
     * Validate that start date is AFTER today (cannot reserve for today or in the past)
     */
    public static boolean validateStartDate(ReservationRequestModel requestModel) {
        LocalDate startDate = requestModel.getStartDate().toLocalDate();
        LocalDate today = LocalDate.now();
        // Start date must be strictly after today (cannot be today or in the past)
        return startDate.isAfter(today);
    }

    public static boolean validateEndDate(ReservationRequestModel requestModel) {
        return requestModel.getEndDate().isAfter(requestModel.getStartDate()) &&
                requestModel.getEndDate().getDayOfWeek().equals(requestModel.getStartDate().getDayOfWeek());
    }

    public static boolean validateMediaId(String mediaId) {
        return mediaId != null && !mediaId.trim().isEmpty();
    }

    public static boolean validateCampaignId(ReservationRequestModel requestModel) {
        return requestModel.getCampaignId() != null && !requestModel.getCampaignId().trim().isEmpty();
    }
}
