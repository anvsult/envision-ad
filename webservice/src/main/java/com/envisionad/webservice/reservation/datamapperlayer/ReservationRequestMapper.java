package com.envisionad.webservice.reservation.datamapperlayer;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReservationRequestMapper {
    Reservation requestModelToEntity(ReservationRequestModel reservationRequestModel);
}
