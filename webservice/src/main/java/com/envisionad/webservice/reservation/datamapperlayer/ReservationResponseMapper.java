package com.envisionad.webservice.reservation.datamapperlayer;

import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReservationResponseMapper {
    ReservationResponseModel entityToResponseModel(Reservation reservation);

    List<ReservationResponseModel> entitiesToResponseModelList(List<Reservation> reservations);
}
