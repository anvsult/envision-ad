package com.envisionad.webservice.proofofdisplay.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.business.dataaccesslayer.Employee;
import com.envisionad.webservice.business.dataaccesslayer.EmployeeRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.proofofdisplay.presentationlayer.models.ProofOfDisplayRequest;
import com.envisionad.webservice.utils.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProofOfDisplayService {

    private static final Logger log = LoggerFactory.getLogger(ProofOfDisplayService.class);

    private final EmailService emailService;
    private final EmployeeRepository employeeRepository;
    private final MediaRepository mediaRepository;
    private final AdCampaignRepository adCampaignRepository;

    public ProofOfDisplayService(
            EmailService emailService,
            EmployeeRepository employeeRepository,
            MediaRepository mediaRepository,
            AdCampaignRepository adCampaignRepository
    ) {
        this.emailService = emailService;
        this.employeeRepository = employeeRepository;
        this.mediaRepository = mediaRepository;
        this.adCampaignRepository = adCampaignRepository;
    }

    public void sendProofEmail(ProofOfDisplayRequest request) {
        try {
            // 1) Validate / fetch media
            Media media = mediaRepository.findById(UUID.fromString(request.getMediaId()))
                    .orElseThrow(() -> new MediaNotFoundException(request.getMediaId()));

            // 2) Validate / fetch campaign
            AdCampaign campaign = adCampaignRepository.findByCampaignId_CampaignId(request.getCampaignId());
            if (campaign == null) {
                throw new AdCampaignNotFoundException(request.getCampaignId());
            }

            // 3) Resolve advertiser email (same approach as reservation: pick an employee email for that business)
            String businessId = campaign.getBusinessId().getBusinessId();

            List<Employee> advertiserEmployees = employeeRepository.findAllByBusinessId_BusinessId(businessId);

            String advertiserEmail = advertiserEmployees.stream()
                    .map(Employee::getEmail)
                    .filter(email -> email != null && !email.isBlank())
                    .findFirst()
                    .orElse(null);

            if (advertiserEmail == null) {
                log.warn("No advertiser email found for business: {}", businessId);
                return;
            }

            // 4) Build a nicer email body
            String subject = "Your ad is live!";

            StringBuilder body = new StringBuilder();
            body.append("Hi there,\n\n");
            body.append("Great news, your ad has been displayed!\n\n");
            body.append("Campaign: ").append(campaign.getName()).append("\n");
            body.append("Media location: ").append(media.getTitle()).append("\n\n");

            body.append("Proof images:\n");
            if (request.getProofImageUrls() == null || request.getProofImageUrls().isEmpty()) {
                body.append("- No images were provided.\n");
            } else {
                for (String url : request.getProofImageUrls()) {
                    body.append("- ").append(url).append("\n");
                }
            }

            body.append("\nThanks for advertising with Envision Ad!\n");
            body.append("— The Envision Ad Team");

            emailService.sendSimpleEmail(advertiserEmail, subject, body.toString());

        } catch (Exception e) {
            // Same philosophy as reservation: log, don’t crash flow
            log.error("Failed to send proof-of-display email. mediaId={} campaignId={}",
                    request.getMediaId(), request.getCampaignId(), e);
        }
    }
}
