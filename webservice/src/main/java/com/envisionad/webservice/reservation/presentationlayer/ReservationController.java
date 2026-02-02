package com.envisionad.webservice.reservation.presentationlayer;

import com.envisionad.webservice.reservation.businesslogiclayer.ReservationService;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/media/{mediaId}/reservations")
@CrossOrigin(origins = { "http://localhost:3000", "https://envision-ad.ca" })
public class ReservationController {
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping()
    @PreAuthorize("hasAuthority('readAll:reservation')")
    public ResponseEntity<List<ReservationResponseModel>> getAllMediaReservations(@PathVariable String mediaId) {
        return ResponseEntity.ok().body(reservationService.getAllReservationsByMediaId(mediaId));
    }

    @PostMapping()
    @PreAuthorize("hasAuthority('create:reservation')")
    public ResponseEntity<ReservationResponseModel> createReservation(@AuthenticationPrincipal Jwt jwt,
            @PathVariable String mediaId, @RequestBody ReservationRequestModel requestModel) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(jwt, mediaId, requestModel));
    }
}
