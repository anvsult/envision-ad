package com.envisionad.webservice.reservation.presentationlayer;

import com.envisionad.webservice.reservation.businesslogiclayer.ReservationService;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
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
@RequestMapping("/api/v1/media")
@CrossOrigin(origins = {"http://localhost:3000", "https://envision-ad.ca"})
public class ReservationController {
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/{mediaId}/reservations")
    @PreAuthorize("hasAuthority('readAll:reservation')")
    public ResponseEntity<List<ReservationResponseModel>> getAllMediaReservations(@AuthenticationPrincipal Jwt jwt, @PathVariable String mediaId) {
        return ResponseEntity.ok(reservationService.getAllReservationsByMediaId(jwt, mediaId));
    }

    @GetMapping("/reservations/{reservationId}")
    @PreAuthorize("hasAuthority('readAll:reservation')")
    public ResponseEntity<ReservationResponseModel> getMediaReservationById(@AuthenticationPrincipal Jwt jwt, @PathVariable String reservationId) {
        return ResponseEntity.ok(reservationService.getReservationByReservationId(jwt, reservationId));
    }

    @PostMapping("/{mediaId}/reservations")
    @PreAuthorize("hasAuthority('create:reservation')")
    public ResponseEntity<ReservationResponseModel> createReservation(@AuthenticationPrincipal Jwt jwt, @PathVariable String mediaId, @RequestBody ReservationRequestModel requestModel) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createReservation(jwt, mediaId, requestModel));
    }

    @PatchMapping("/{mediaId}/reservations/{reservationId}")
    @PreAuthorize("hasAuthority('update:reservation')")
    public ResponseEntity<ReservationResponseModel> updateReservationStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable String mediaId, @PathVariable String reservationId, @RequestParam ReservationStatus status){
        return ResponseEntity.ok(reservationService.updateReservationStatus(jwt, mediaId, reservationId, status));
    }

    @GetMapping("/reservations/media-owner")
    @PreAuthorize("hasAuthority('readAll:reservation')")
    public ResponseEntity<List<ReservationResponseModel>> getAllReservationByMediaOwnerBusinessId(@AuthenticationPrincipal Jwt jwt, @RequestParam String businessId){
        return ResponseEntity.ok(reservationService.getAllReservationByMediaOwnerBusinessId(jwt, businessId));
    }

    @GetMapping("/reservations/advertiser")
    @PreAuthorize("hasAuthority('readAll:reservation')")
    public ResponseEntity<List<ReservationResponseModel>> getAllReservationByAdvertiserBusinessId(@AuthenticationPrincipal Jwt jwt, @RequestParam String businessId){
        return ResponseEntity.ok(reservationService.getAllReservationByAdvertiserBusinessId(jwt, businessId));
    }
}
