package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public interface ReservationService {
    List<ReservationResponseModel> getAllReservationsByMediaId(Jwt jwt, String mediaId);
    ReservationResponseModel createReservation(Jwt jwt, String mediaId, ReservationRequestModel requestModel);
    ReservationResponseModel updateReservationStatus(Jwt jwt, String mediaId, String reservationId, ReservationStatus status);
    List<ReservationResponseModel> getAllReservationBySeller(Jwt jwt, String businessId);
    List<ReservationResponseModel> getAllReservationByBuyer(Jwt jwt, String businessId);
}
