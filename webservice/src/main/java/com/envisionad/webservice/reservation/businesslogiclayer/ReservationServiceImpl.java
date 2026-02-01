package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntent;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentIntentRepository;
import com.envisionad.webservice.payment.dataaccesslayer.PaymentStatus;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationRequestMapper;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationResponseMapper;
import com.envisionad.webservice.reservation.exceptions.InsufficientLoopDurationException;
import com.envisionad.webservice.reservation.exceptions.PaymentVerificationException;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import com.envisionad.webservice.reservation.utils.ReservationValidator;
import com.envisionad.webservice.utils.JwtUtils;
import com.stripe.exception.StripeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservationRepository;
    private final MediaRepository mediaRepository;
    private final AdCampaignRepository adCampaignRepository;
    private final ReservationRequestMapper reservationRequestMapper;
    private final ReservationResponseMapper reservationResponseMapper;
    private final JwtUtils jwtUtils;
    private final PaymentIntentRepository paymentIntentRepository;

    public ReservationServiceImpl(ReservationRepository reservationRepository, MediaRepository mediaRepository,
                                  AdCampaignRepository adCampaignRepository, ReservationRequestMapper reservationRequestMapper,
                                  ReservationResponseMapper reservationResponseMapper, JwtUtils jwtUtils,
                                  PaymentIntentRepository paymentIntentRepository) {
        this.reservationRepository = reservationRepository;
        this.mediaRepository = mediaRepository;
        this.adCampaignRepository = adCampaignRepository;
        this.reservationRequestMapper = reservationRequestMapper;
        this.reservationResponseMapper = reservationResponseMapper;
        this.jwtUtils = jwtUtils;
        this.paymentIntentRepository = paymentIntentRepository;
    }

    @Override
    public List<ReservationResponseModel> getAllReservationsByMediaId(String mediaId) {
        List<Reservation> reservations =
                reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId));

        List<ReservationResponseModel> response =
                reservationResponseMapper.entitiesToResponseModelList(reservations);

        // collect unique campaignIds from reservations
        List<String> campaignIds = reservations.stream()
                .map(Reservation::getCampaignId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        if (campaignIds.isEmpty()) return response;

        // batch fetch campaigns
        var campaigns = adCampaignRepository.findAllByCampaignId_CampaignIdIn(campaignIds);

        // map campaignId to campaignName
        var campaignNameById = campaigns.stream()
                .collect(java.util.stream.Collectors.toMap(
                        c -> c.getCampaignId().getCampaignId(),
                        AdCampaign::getName
                ));

        // fill campaignName in the response models
        response.forEach(r -> r.setCampaignName(campaignNameById.get(r.getCampaignId())));

        return response;
    }

    @Override
    @Transactional
    public ReservationResponseModel createReservation(Jwt jwt, String mediaId, ReservationRequestModel requestModel) {
        // 1. Validate input and authentication
        ReservationValidator.validateReservation(requestModel, mediaId);
        String userId = jwtUtils.extractUserId(jwt);

        // 2. Load and validate entities
        Media media = loadAndValidateMedia(mediaId);
        AdCampaign campaign = loadAndValidateCampaign(requestModel.getCampaignId());

        // 3. Validate user permissions
        String businessId = campaign.getBusinessId().getBusinessId();
        jwtUtils.validateUserIsEmployeeOfBusiness(userId, businessId);
        jwtUtils.validateBusinessOwnsCampaign(businessId, campaign);

//        // Prevent a business from reserving their own media
//        String mediaOwnerBusinessId = media.getBusinessId().toString();
//        if (businessId.equals(mediaOwnerBusinessId)) {
//            throw new IllegalStateException("A business cannot reserve its own media");
//        }

        // 4. Validate media availability
        validateMediaHasLoopDurationLeft(media, requestModel);

        // 5. Calculate price
        BigDecimal totalPrice = calculateTotalPrice(media, requestModel);

        // 6. Handle payment and reservation creation
        Reservation reservation;
        String paymentIntentId = requestModel.getPaymentIntentId();

        if (paymentIntentId != null && !paymentIntentId.isBlank()) {
            // Payment flow: verify payment and create/update reservation
            reservation = handlePaidReservation(paymentIntentId, requestModel, media, userId, totalPrice);
        } else {
            // No payment provided: create pending reservation (webhook will confirm)
            reservation = createPendingReservation(requestModel, media, userId, totalPrice);
        }

        // 7. Save reservation
        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Reservation {} created with status: {}", savedReservation.getReservationId(), savedReservation.getStatus());

        return reservationResponseMapper.entityToResponseModel(savedReservation);
    }

    private Media loadAndValidateMedia(String mediaId) {
        Media media = mediaRepository.findById(UUID.fromString(mediaId))
                .orElseThrow(() -> new MediaNotFoundException(mediaId));

        if (media.getPrice() == null || media.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Media does not have a valid price");
        }

        return media;
    }

    private AdCampaign loadAndValidateCampaign(String campaignId) {
        AdCampaign campaign = adCampaignRepository.findByCampaignId_CampaignId(campaignId);
        if (campaign == null) {
            throw new AdCampaignNotFoundException(campaignId);
        }
        return campaign;
    }

    private BigDecimal calculateTotalPrice(Media media, ReservationRequestModel requestModel) {
        long days = Duration.between(requestModel.getStartDate(), requestModel.getEndDate()).toDays();
        int weeks = (int) Math.max(1, Math.ceil(days / 7.0));
        return media.getPrice().multiply(BigDecimal.valueOf(weeks));
    }

    private Reservation handlePaidReservation(String paymentIntentId, ReservationRequestModel requestModel,
                                              Media media, String userId, BigDecimal totalPrice) {
        try {
            com.stripe.model.PaymentIntent intent = com.stripe.model.PaymentIntent.retrieve(paymentIntentId);

            // Verify payment succeeded
            if (!"succeeded".equals(intent.getStatus())) {
                throw new PaymentVerificationException(
                        String.format("PaymentIntent %s has status '%s', expected 'succeeded'",
                                paymentIntentId, intent.getStatus())
                );
            }

            // Extract and validate metadata
            Map<String, String> metadata = intent.getMetadata();
            if (metadata == null || metadata.isEmpty()) {
                throw new PaymentVerificationException("PaymentIntent missing required metadata");
            }

            String metaReservationId = metadata.get("reservationId");
            String metaBusinessId = metadata.get("businessId");

//            // Ensure the PaymentIntent was created for the media owner (destination)
//            if (metaBusinessId == null || metaBusinessId.isBlank()) {
//                throw new PaymentVerificationException("PaymentIntent metadata missing businessId");
//            }


            // CRITICAL SECURITY CHECK: Verify this PaymentIntent hasn't been used before
            Optional<PaymentIntent> existingPayment = paymentIntentRepository.findByStripePaymentIntentId(paymentIntentId);
            if (existingPayment.isPresent()) {
                PaymentIntent payment = existingPayment.get();

                // If payment already has a reservation, ensure we're not creating a duplicate
                if (payment.getReservationId() != null && !payment.getReservationId().isEmpty()) {
                    // This PaymentIntent is already associated with a reservation
                    String existingReservationId = payment.getReservationId();

                    // If metadata reservationId matches the existing one, it's idempotent (OK)
                    if (metaReservationId != null && metaReservationId.equals(existingReservationId)) {
                        log.info("PaymentIntent {} already used for reservation {}, returning existing",
                                paymentIntentId, existingReservationId);

                        // Return the existing reservation
                        Optional<Reservation> existingRes = reservationRepository.findByReservationId(existingReservationId);
                        if (existingRes.isPresent()) {
                            return existingRes.get();
                        }
                    } else {
                        // PaymentIntent is being reused for a DIFFERENT reservation - REJECT
                        throw new PaymentVerificationException(
                                String.format("PaymentIntent %s is already associated with reservation %s, cannot reuse for another reservation",
                                        paymentIntentId, existingReservationId)
                        );
                    }
                }
            }

            // Verify amount and currency
            long expectedCents = totalPrice.setScale(2, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).longValueExact();

            Long intentAmount = intent.getAmount();
            String intentCurrency = intent.getCurrency();

            if (intentAmount == null || intentAmount != expectedCents) {
                throw new PaymentVerificationException(
                        String.format("PaymentIntent amount mismatch: expected %d cents, got %d cents",
                                expectedCents, intentAmount)
                );
            }

            if (intentCurrency == null || !intentCurrency.equalsIgnoreCase("cad")) {
                throw new PaymentVerificationException(
                        String.format("PaymentIntent currency mismatch: expected CAD, got %s", intentCurrency)
                );
            }

            // Check if reservation already exists by metadata reservationId (idempotency)
            Reservation existingReservation = null;
            if (metaReservationId != null && !metaReservationId.isBlank()) {
                existingReservation = reservationRepository.findByReservationId(metaReservationId).orElse(null);
            }

            if (existingReservation != null) {
                // Reservation exists - verify it matches the payment
                log.info("Reservation {} already exists for PaymentIntent {}", metaReservationId, paymentIntentId);

                // Update to confirmed if it was pending
                if (existingReservation.getStatus() != ReservationStatus.CONFIRMED) {
                    existingReservation.setStatus(ReservationStatus.CONFIRMED);
                    existingReservation.setTotalPrice(totalPrice);
                    existingReservation.setAdvertiserId(userId);
                }

                return existingReservation;
            }

            // Create new confirmed reservation
            // Use reservationId from metadata if available, otherwise generate new one
            String reservationId = (metaReservationId != null && !metaReservationId.isBlank())
                    ? metaReservationId
                    : UUID.randomUUID().toString();

            log.info("Creating new CONFIRMED reservation: {}", reservationId);
            Reservation reservation = reservationRequestMapper.requestModelToEntity(requestModel);
            reservation.setReservationId(reservationId);
            reservation.setMediaId(media.getId());
            reservation.setTotalPrice(totalPrice);
            reservation.setAdvertiserId(userId);
            reservation.setStatus(ReservationStatus.CONFIRMED);

            // CRITICAL: Mark this PaymentIntent as consumed to prevent reuse
            if (existingPayment.isPresent()) {
                PaymentIntent payment = existingPayment.get();
                // Update if reservationId is not set yet
                if (payment.getReservationId() == null || payment.getReservationId().isEmpty()) {
                    payment.setReservationId(reservationId);
                    payment.setStatus(PaymentStatus.SUCCEEDED);
                    paymentIntentRepository.save(payment);
                    log.info("Updated existing payment record {} with reservation {}", paymentIntentId, reservationId);
                }
            } else {
                // Create new payment record
                PaymentIntent newPayment = new PaymentIntent();
                newPayment.setStripePaymentIntentId(paymentIntentId);
                newPayment.setReservationId(reservationId);
                newPayment.setBusinessId(metaBusinessId);
                newPayment.setAmount(totalPrice);
                newPayment.setStatus(PaymentStatus.SUCCEEDED);
                newPayment.setCreatedAt(java.time.LocalDateTime.now());
                paymentIntentRepository.save(newPayment);
                log.info("Created payment record for PaymentIntent {} and reservation {}", paymentIntentId, reservationId);
            }

            return reservation;

        } catch (StripeException e) {
            log.error("Failed to retrieve PaymentIntent {}: {}", paymentIntentId, e.getMessage(), e);
            throw new PaymentVerificationException("Failed to verify payment with Stripe: " + e.getMessage(), e);
        }
    }

    private Reservation createPendingReservation(ReservationRequestModel requestModel, Media media,
                                                 String userId, BigDecimal totalPrice) {
        log.info("Creating new PENDING reservation (no payment provided, webhook will confirm)");
        Reservation reservation = reservationRequestMapper.requestModelToEntity(requestModel);
        reservation.setReservationId(UUID.randomUUID().toString());
        reservation.setMediaId(media.getId());
        reservation.setTotalPrice(totalPrice);
        reservation.setAdvertiserId(userId);
        reservation.setStatus(ReservationStatus.PENDING);
        return reservation;
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
}

