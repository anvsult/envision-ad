package com.envisionad.webservice.reservation.datamapperlayer;

import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReservationResponseMapper {
    @Mapping(target = "campaignId", source = "campaignId")
    ReservationResponseModel entityToResponseModel(Reservation reservation);

    List<ReservationResponseModel> entitiesToResponseModelList(List<Reservation> reservations);
}
