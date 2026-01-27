// java
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
import com.envisionad.webservice.reservation.exceptions.InsufficientLoopDurationException;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import com.envisionad.webservice.reservation.utils.ReservationValidator;
import com.envisionad.webservice.utils.EmailService;
import com.envisionad.webservice.utils.JwtUtils;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Slf4j
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

        // We do not expect the frontend to provide reservationId. If a PaymentIntent is provided below
        // its metadata may contain a reservationId created earlier during payment initialization —
        // we'll attempt to load that reservation once we retrieve the PaymentIntent.
        Reservation reservation = null;

        // Verify payment with Stripe before marking reservation as CONFIRMED when a paymentIntentId is provided.
        boolean paymentVerified = false;
        String paymentIntentId = requestModel.getPaymentIntentId();
        try {
            if (paymentIntentId != null && !paymentIntentId.isBlank()) {
                try {
                    PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);

                    // Check status
                    if (!"succeeded".equals(intent.getStatus())) {
                        log.warn("PaymentIntent {} has non-terminal status: {}", paymentIntentId, intent.getStatus());
                    } else {
                        // Verify amount and currency
                        long expectedCents = totalPrice.setScale(2, java.math.RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100)).longValueExact();

                        Long intentAmount = intent.getAmount(); // already in cents
                        String intentCurrency = intent.getCurrency();

                        String metaReservationId = intent.getMetadata() != null ? intent.getMetadata().get("reservationId") : null;

                        if (metaReservationId != null && !metaReservationId.isBlank()) {
                            reservation = reservationRepository.findByReservationId(metaReservationId).orElse(null);
                            if (reservation == null) {
                                log.info("PaymentIntent metadata references reservationId={} but no DB reservation found; will create one.", metaReservationId);
                            }
                        }

                        boolean amountMatches = intentAmount != null && intentAmount == expectedCents;
                        boolean currencyMatches = intentCurrency != null && intentCurrency.equalsIgnoreCase("cad");

                        // If we have a DB reservation loaded, ensure the metadata points to the same id
                        boolean reservationMatches = true;
                        if (reservation != null) {
                            reservationMatches = metaReservationId.equals(reservation.getReservationId());
                        }

                        if (amountMatches && currencyMatches && reservationMatches) {
                            paymentVerified = true;
                        } else {
                            log.warn("PaymentIntent verification failed for {}: amountMatches={}, currencyMatches={}, reservationMatches={}", paymentIntentId, amountMatches, currencyMatches, reservationMatches);
                        }
                    }
                } catch (StripeException se) {
                    log.error("Failed to retrieve PaymentIntent {}: {}", paymentIntentId, se.getMessage(), se);
                }
            }
        } catch (Exception e) {
            log.error("Unexpected error during payment verification: {}", e.getMessage(), e);
        }

        // Create and populate reservation if it wasn't loaded from DB
        if (reservation == null) {
            reservation = reservationRequestMapper.requestModelToEntity(requestModel);
            reservation.setReservationId(UUID.randomUUID().toString());
            reservation.setMediaId(media.getId());
            reservation.setTotalPrice(totalPrice);
            reservation.setAdvertiserId(userId);
        } else {
            // Update total price in case calculation changed and ensure key fields are set
            reservation.setTotalPrice(totalPrice);
            reservation.setAdvertiserId(userId);
            reservation.setMediaId(media.getId());
        }

        if (paymentVerified) {
            reservation.setStatus(ReservationStatus.CONFIRMED);
        } else {
            // keep Pending until payment verified by webhook or manual reconciliation
            if (reservation.getStatus() == null) reservation.setStatus(ReservationStatus.PENDING);
            log.warn("Reservation created/left in PENDING state because payment could not be verified. reservationId={}", reservation.getReservationId());
        }

        Reservation savedReservation = reservationRepository.save(reservation);

        // Get all media owners of the business and email them
        String mediaOwnerBusinessId = media.getBusinessId().toString();
        List<Employee> mediaOwners = employeeRepository.findAllByBusinessId_BusinessId(mediaOwnerBusinessId);
        List<String> mediaOwnerEmailAddresses = mediaOwners.stream()
                .map(Employee::getEmail)
                .filter(email -> email != null && !email.isEmpty())
                .distinct()
                .toList();

        if (!mediaOwnerEmailAddresses.isEmpty()) {
            for (String ownerEmailAddress : mediaOwnerEmailAddresses) {
                sendReservationEmail(ownerEmailAddress, media, savedReservation, campaign, totalPrice);
            }
        } else {
            log.warn("No email found for media owner in business: {}", mediaOwnerBusinessId);
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
            throw new InsufficientLoopDurationException();
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
