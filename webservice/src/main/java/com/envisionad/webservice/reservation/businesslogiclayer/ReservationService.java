package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;

import java.util.List;

public interface ReservationService {
    List<ReservationResponseModel> getAllReservations();

    ReservationResponseModel createReservation(ReservationRequestModel request);
}
