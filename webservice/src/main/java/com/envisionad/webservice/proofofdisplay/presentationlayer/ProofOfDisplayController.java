package com.envisionad.webservice.proofofdisplay.presentationlayer;

import com.envisionad.webservice.proofofdisplay.businesslogiclayer.ProofOfDisplayService;
import com.envisionad.webservice.proofofdisplay.exceptions.AdvertiserEmailNotFoundException;
import com.envisionad.webservice.proofofdisplay.presentationlayer.models.ProofOfDisplayRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/proof-of-display")
@CrossOrigin(origins = {"http://localhost:3000", "https://envision-ad.ca"})
public class ProofOfDisplayController {

    private final ProofOfDisplayService service;

    public ProofOfDisplayController(ProofOfDisplayService service) {
        this.service = service;
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/email")
    public ResponseEntity<Void> sendProof(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProofOfDisplayRequest request) {
        try {
            service.sendProofEmail(jwt, request);
            return ResponseEntity.ok().build();
        } catch (AdvertiserEmailNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}