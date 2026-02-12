package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.presentationlayer.models.DenialDetailsRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public interface ReservationService {
    List<ReservationResponseModel> getAllReservationsByMediaId(Jwt jwt, String mediaId);
    ReservationResponseModel getReservationByReservationId(Jwt jwt, String reservationId);
    ReservationResponseModel createReservation(Jwt jwt, String mediaId, ReservationRequestModel requestModel);
    ReservationResponseModel approveReservation(Jwt jwt, String mediaId, String reservationId);
    ReservationResponseModel denyReservation(Jwt jwt, String mediaId, String reservationId, DenialDetailsRequestModel denialDetailsRequestModel);
    List<ReservationResponseModel> getAllReservationByMediaOwnerBusinessId(Jwt jwt, String businessId);
    List<ReservationResponseModel> getAllReservationByAdvertiserBusinessId(Jwt jwt, String businessId);
}
