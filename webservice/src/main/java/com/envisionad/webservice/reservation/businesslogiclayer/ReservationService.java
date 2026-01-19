package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public interface ReservationService {
    List<ReservationResponseModel> getAllReservationsByMediaId(String mediaId);

    ReservationResponseModel createReservation(Jwt jwt, String mediaId, ReservationRequestModel requestModel);
}
