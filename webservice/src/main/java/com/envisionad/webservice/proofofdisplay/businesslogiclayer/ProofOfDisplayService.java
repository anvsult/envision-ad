package com.envisionad.webservice.proofofdisplay.businesslogiclayer;

import com.envisionad.webservice.proofofdisplay.presentationlayer.models.ProofOfDisplayRequest;
import com.envisionad.webservice.utils.EmailService;
import org.springframework.stereotype.Service;

@Service
public class ProofOfDisplayService {

    private final EmailService emailService;

    public ProofOfDisplayService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void sendProofEmail(ProofOfDisplayRequest request) {

        String subject = "Your Advertisement is Live!";

        StringBuilder body = new StringBuilder();

        body.append("Hi there,\n\n");
        body.append("Great news, your ad is officially live!\n\n");

        body.append("Proof of display for your campaign:\n\n");
        body.append("Campaign: ").append(request.getCampaignName()).append("\n");
        body.append("Media location: ").append(request.getMediaName()).append("\n\n");

        body.append("Proof images:\n");
        for (String url : request.getProofImageUrls()) {
            body.append("- ").append(url).append("\n");
        }

        body.append("\nThanks for advertising with Envision Ad!\n");
        body.append("- The Envision Ad Team");

        emailService.sendSimpleEmail(
                request.getAdvertiserEmail(),
                subject,
                body.toString()
        );
    }
}
