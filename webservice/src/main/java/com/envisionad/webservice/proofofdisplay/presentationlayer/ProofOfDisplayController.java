package com.envisionad.webservice.proofofdisplay.presentationlayer;

import com.envisionad.webservice.proofofdisplay.businesslogiclayer.ProofOfDisplayService;
import com.envisionad.webservice.proofofdisplay.presentationlayer.models.ProofOfDisplayRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/proof-of-display")
@CrossOrigin(origins = {"http://localhost:3000", "https://envision-ad.ca"})
public class ProofOfDisplayController {

    private final ProofOfDisplayService service;

    public ProofOfDisplayController(ProofOfDisplayService service) {
        this.service = service;
    }

    @PostMapping("/email")
    public ResponseEntity<Void> sendProof(@RequestBody ProofOfDisplayRequest request) {
        service.sendProofEmail(request);
        return ResponseEntity.ok().build();
    }
}
