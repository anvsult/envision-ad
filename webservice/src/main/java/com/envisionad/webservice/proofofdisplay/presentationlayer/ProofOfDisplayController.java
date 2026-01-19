package com.envisionad.webservice.proofofdisplay.presentationlayer;

import com.envisionad.webservice.proofofdisplay.businesslogiclayer.ProofOfDisplayService;
import com.envisionad.webservice.proofofdisplay.presentationlayer.models.ProofOfDisplayRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/proof-of-display")
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
