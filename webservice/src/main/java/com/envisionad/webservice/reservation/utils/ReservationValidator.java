package com.envisionad.webservice.reservation.utils;

import com.envisionad.webservice.reservation.exceptions.InvalidReservationException;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;

import java.time.LocalDateTime;

public class ReservationValidator {
    public static void validateReservation(ReservationRequestModel requestModel) {
        if (requestModel == null || !validateStartDate(requestModel) || !validateEndDate(requestModel) || !validateMediaId(requestModel) || !validateCampaignId(requestModel))
            throw new InvalidReservationException();
    }

    public static boolean validateStartDate(ReservationRequestModel requestModel) {
        return requestModel.getStartDate().isAfter(LocalDateTime.now());
    }

    public static boolean validateEndDate(ReservationRequestModel requestModel) {
        return requestModel.getEndDate().isAfter(requestModel.getStartDate()) &&
                requestModel.getEndDate().getDayOfWeek().equals(requestModel.getStartDate().getDayOfWeek());
    }

    public static boolean validateMediaId(ReservationRequestModel requestModel) {
        return requestModel.getMediaId() != null && !requestModel.getMediaId().trim().isEmpty();
    }

    public static boolean validateCampaignId(ReservationRequestModel requestModel) {
        return requestModel.getCampaignId() != null && !requestModel.getCampaignId().trim().isEmpty();
    }
}
