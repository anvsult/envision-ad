package com.envisionad.webservice.reservation.presentationlayer;

import com.envisionad.webservice.reservation.businesslogiclayer.ReservationService;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping()
    public ResponseEntity<List<ReservationResponseModel>> getAllReservations() {
        return ResponseEntity.ok().body(reservationService.getAllReservations());
    }

    @PostMapping()
    public ResponseEntity<ReservationResponseModel> createReservation(
            @RequestBody ReservationRequestModel requestModel
            ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createReservation(requestModel));
    }
}
