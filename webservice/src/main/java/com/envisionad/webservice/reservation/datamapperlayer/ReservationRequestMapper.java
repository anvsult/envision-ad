package com.envisionad.webservice.reservation.datamapperlayer;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReservationRequestMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reservationId", ignore = true)

    @Mapping(target = "status", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "advertiserId", ignore = true)

    @Mapping(source = "campaignId", target = "campaignId")
    Reservation requestModelToEntity(ReservationRequestModel reservationRequestModel);
}
