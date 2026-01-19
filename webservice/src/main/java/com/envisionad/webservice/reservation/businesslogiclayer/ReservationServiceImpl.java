package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.businesslogiclayer.AdCampaignService;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.business.dataaccesslayer.Employee;
import com.envisionad.webservice.business.dataaccesslayer.EmployeeRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationRequestMapper;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationResponseMapper;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import com.envisionad.webservice.reservation.utils.ReservationValidator;
import com.envisionad.webservice.utils.EmailService;
import com.envisionad.webservice.utils.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationServiceImpl implements ReservationService {
    private final EmailService emailService;
    private final EmployeeRepository employeeRepository;
    private final ReservationRepository reservationRepository;
    private final MediaRepository mediaRepository; // We need this to get the Price
    private final AdCampaignRepository adCampaignRepository; // To link the campaign
    private final ReservationRequestMapper reservationRequestMapper;
    private final ReservationResponseMapper reservationResponseMapper;
    private final AdCampaignService adCampaignService;
    private final JwtUtils jwtUtils;
    private static final Logger log = LoggerFactory.getLogger(ReservationServiceImpl.class);

    public ReservationServiceImpl(EmailService emailService, EmployeeRepository employeeRepository, ReservationRepository reservationRepository, MediaRepository mediaRepository, AdCampaignRepository adCampaignRepository, ReservationRequestMapper reservationRequestMapper, ReservationResponseMapper reservationResponseMapper, AdCampaignService adCampaignService, JwtUtils jwtUtils) {
        this.emailService = emailService;
        this.employeeRepository = employeeRepository;
        this.reservationRepository = reservationRepository;
        this.mediaRepository = mediaRepository;
        this.adCampaignRepository = adCampaignRepository;
        this.reservationRequestMapper = reservationRequestMapper;
        this.reservationResponseMapper = reservationResponseMapper;
        this.adCampaignService = adCampaignService;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public List<ReservationResponseModel> getAllReservationsByMediaId(String mediaId) {
        List<Reservation> reservations = reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId));
        return reservationResponseMapper.entitiesToResponseModelList(reservations);
    }

    @Override
    public ReservationResponseModel createReservation(Jwt jwt, String mediaId, ReservationRequestModel requestModel) {
        ReservationValidator.validateReservation(requestModel);

        if (jwt == null || jwt.getSubject() == null) {
            throw new SecurityException("Invalid JWT token or subject");
        }

        String userId = jwtUtils.extractUserId(jwt);

        // Validate media exists
        Media media = mediaRepository.findById(UUID.fromString(mediaId))
                .orElseThrow(() -> new MediaNotFoundException(mediaId));

        if (media.getPrice() == null || media.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Media does not have a valid price");
        }

        // Validate campaign exists and user has access
        AdCampaign campaign = adCampaignRepository.findByCampaignId_CampaignId(requestModel.getCampaignId());
        if (campaign == null) {
            throw new AdCampaignNotFoundException(requestModel.getCampaignId());
        }

        // Validate that the media is available for the requested dates
        validateMediaHasLoopDurationLeft(media, requestModel);

        // Validate that the user is an employee of the business that owns the campaign
        String businessId = campaign.getBusinessId().getBusinessId();

        // Validate user is employee of the business
        jwtUtils.validateUserIsEmployeeOfBusiness(userId, businessId);

        // Validate business owns the campaign
        jwtUtils.validateBusinessOwnsCampaign(businessId, campaign);

        // Calculate price
        long days = Duration.between(requestModel.getStartDate(), requestModel.getEndDate()).toDays();
        int weeks = (int)Math.max(1, Math.ceil(days / 7.0));
        BigDecimal totalPrice = media.getPrice().multiply(BigDecimal.valueOf(weeks));

        // Create and populate reservation
        Reservation reservation = reservationRequestMapper.requestModelToEntity(requestModel);
        reservation.setReservationId(UUID.randomUUID().toString());
        reservation.setMediaId(media.getId());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setAdvertiserId(userId);

        Reservation savedReservation = reservationRepository.save(reservation);

        // Get media owner's email from the business that owns the media
        // TODO: This currently gets any employee email - should filter to actual media owner
        List<Employee> mediaOwners = employeeRepository.findAllByBusinessId_BusinessId(businessId);
        String mediaOwnerEmailAddress = mediaOwners.stream()
                .map(Employee::getEmail)
                .filter(email -> email != null && !email.isEmpty())
                .findFirst()
                .orElse(null);

        if (mediaOwnerEmailAddress != null) {
            sendReservationEmail(mediaOwnerEmailAddress, media, savedReservation, campaign, totalPrice);
        } else {
            log.warn("No email found for media owner in business: {}", businessId);
        }

        return reservationResponseMapper.entityToResponseModel(savedReservation);
    }

    private void validateMediaHasLoopDurationLeft(Media media, ReservationRequestModel requestModel) {
        List<AdCampaign> alreadyReservedCampaigns = reservationRepository.findAllActiveReservationsByMediaIdAndDateRange(
                media.getId(),
                requestModel.getStartDate(),
                requestModel.getEndDate()
        ).stream()
         .map(reservation -> adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId()))
         .toList();
        int totalReservedDuration = alreadyReservedCampaigns.stream()
                .flatMap(campaign -> campaign.getAds().stream())
                .mapToInt(ad -> ad.getAdDurationSeconds() != null ? ad.getAdDurationSeconds().getSeconds() : 0)
                .sum();
        if (media.getLoopDuration() <= totalReservedDuration) {
            throw new IllegalStateException("Media does not have enough loop duration left for the requested reservation period");
        }
    }

    private void sendReservationEmail(String ownerEmail, Media media, Reservation reservation,
                                      AdCampaign campaign, BigDecimal totalPrice) {
        try {
            List<String> imageLinks = adCampaignService.getAllCampaignImageLinks(campaign.getCampaignId().getCampaignId());

            String previewSection;
            if (imageLinks == null || imageLinks.isEmpty()) {
                previewSection = "No preview images available.";
            } else {
                StringBuilder sb = new StringBuilder("Preview Images:")
                        .append(System.lineSeparator());
                for (String link : imageLinks) {
                    sb.append("- ")
                            .append(link)
                            .append(System.lineSeparator());
                }
                previewSection = sb.toString().trim();
            }

            String emailBody = String.format(
                    "A new reservation has been created for your media%n" +
                    "Media Name: %s%n" +
                    "Ad Campaign Name: %s%n" +
                    "Total Price: $%.2f%n" +
                    "%s",
                    media.getTitle(), campaign.getName(), totalPrice, previewSection
            );
            emailService.sendSimpleEmail(ownerEmail, "New Reservation Created", emailBody);
        } catch (Exception e) {
//            I made it log the error instead of throwing an exception to avoid failing the reservation creation
            log.error("Failed to send reservation notification email for reservation: {} to owner: {}",
                    reservation.getReservationId(), ownerEmail, e);
        }
    }

}

