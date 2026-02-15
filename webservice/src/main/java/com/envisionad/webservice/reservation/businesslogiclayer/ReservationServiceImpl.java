package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessRepository;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.reservation.dataaccesslayer.*;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationRequestMapper;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationResponseMapper;
import com.envisionad.webservice.reservation.exceptions.*;
import com.envisionad.webservice.reservation.presentationlayer.models.DenialDetailsRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import com.envisionad.webservice.reservation.utils.ReservationValidator;
import com.envisionad.webservice.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final BusinessRepository businessRepository;

    public ReservationServiceImpl(ReservationRepository reservationRepository, MediaRepository mediaRepository,
                                  AdCampaignRepository adCampaignRepository, ReservationRequestMapper reservationRequestMapper,
                                  ReservationResponseMapper reservationResponseMapper, JwtUtils jwtUtils,
                                  BusinessRepository businessRepository) {
        this.reservationRepository = reservationRepository;
        this.mediaRepository = mediaRepository;
        this.adCampaignRepository = adCampaignRepository;
        this.reservationRequestMapper = reservationRequestMapper;
        this.reservationResponseMapper = reservationResponseMapper;
        this.jwtUtils = jwtUtils;
        this.businessRepository = businessRepository;
    }

    @Override
    public List<ReservationResponseModel> getAllReservationsByMediaId(Jwt jwt, String mediaId) {
        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, mediaRepository.findById(UUID.fromString(mediaId)).orElseThrow(() -> new MediaNotFoundException(mediaId)).getBusinessId().toString());

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
    public ReservationResponseModel getReservationByReservationId(Jwt jwt, String reservationId) {
        Reservation reservation = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ReservationNotFoundException(reservationId));

        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, mediaRepository.findById(UUID.fromString(reservation.getMediaId().toString())).orElseThrow(() -> new MediaNotFoundException(reservation.getMediaId().toString())).getBusinessId().toString());

        return reservationResponseMapper.entityToResponseModel(reservation);
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

        // 4. Validate non-conflicting reservation with same ad campaign, media and date range
        boolean hasConflict = reservationRepository.existsByMediaIdAndCampaignIdAndDateRange(
                media.getId(), requestModel.getCampaignId(), requestModel.getStartDate(), requestModel.getEndDate());

        if (hasConflict) {
            throw new ReservationConflictException();
        }

        // 4. Calculate price
        BigDecimal totalPrice = calculateTotalPrice(media, requestModel);

        // 5. Create pending reservation
        Reservation reservation = createPendingReservation(requestModel, media, userId, totalPrice);

        // 6. Save reservation
        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Reservation {} created with status: {}", savedReservation.getReservationId(), savedReservation.getStatus());

        return reservationResponseMapper.entityToResponseModel(savedReservation);
    }

    @Override
    public ReservationResponseModel approveReservation(Jwt jwt, String mediaId, String reservationId) {
        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, mediaRepository.findById(UUID.fromString(mediaId)).orElseThrow(() -> new MediaNotFoundException(mediaId)).getBusinessId().toString());

        Reservation reservation = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ReservationNotFoundException(reservationId));

        if (!reservation.getStatus().equals(ReservationStatus.PENDING)){
            throw new ReservationAlreadyProcessedException();
        }

        reservation.setStatus(ReservationStatus.APPROVED);
        reservationRepository.save(reservation);

        return reservationResponseMapper.entityToResponseModel(reservation);
    }

    @Override
    public ReservationResponseModel denyReservation(Jwt jwt, String mediaId, String reservationId, DenialDetailsRequestModel denialDetailsRequestModel) {
        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, mediaRepository.findById(UUID.fromString(mediaId)).orElseThrow(() -> new MediaNotFoundException(mediaId)).getBusinessId().toString());

        Reservation reservation = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ReservationNotFoundException(reservationId));

        if (!reservation.getStatus().equals(ReservationStatus.PENDING)){
            throw new ReservationAlreadyProcessedException();
        }

        if (denialDetailsRequestModel == null || denialDetailsRequestModel.getReason() == null) {
            throw new BadReservationRequestException();
        }

        if (denialDetailsRequestModel.getReason().equals(DenialReason.OTHER) && (denialDetailsRequestModel.getDescription() == null || denialDetailsRequestModel.getDescription().isBlank())){
            throw new BadReservationRequestException();
        }

        DenialDetails details = new DenialDetails();
        details.setReason(denialDetailsRequestModel.getReason());
        details.setDescription(denialDetailsRequestModel.getDescription());


        reservation.setStatus(ReservationStatus.DENIED);
        reservation.setDenialDetails(details);
        reservationRepository.save(reservation);

        return reservationResponseMapper.entityToResponseModel(reservation);
    }

    @Override
    public List<ReservationResponseModel> getAllReservationByMediaOwnerBusinessId(Jwt jwt, String businessId) {
        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, businessId);
        UUID businessUuid = UUID.fromString(businessId);

        List<Reservation> mediaOwnerReservations = reservationRepository.findAll().stream()
                .filter(reservation -> mediaRepository.findById(reservation.getMediaId())
                        .stream()
                        .anyMatch(media -> media.getBusinessId().equals(businessUuid)))
                .toList();

        List<ReservationResponseModel> responses =
                reservationResponseMapper.entitiesToResponseModelList(mediaOwnerReservations);

        List<UUID> mediaIds = mediaOwnerReservations.stream()
                .map(Reservation::getMediaId)
                .distinct()
                .toList();

        Map<UUID, Media> mediaById = mediaIds.isEmpty()
                ? new HashMap<>()
                : mediaRepository.findAllByIdWithLocation(mediaIds).stream()
                        .collect(java.util.stream.Collectors.toMap(
                                Media::getId,
                                media -> media
                        ));

        List<String> campaignIds = responses.stream()
                .map(ReservationResponseModel::getCampaignId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        Map<String, AdCampaign> campaignById = campaignIds.isEmpty()
                ? new HashMap<>()
                : adCampaignRepository.findAllByCampaignId_CampaignIdIn(campaignIds)
                        .stream()
                        .collect(java.util.stream.Collectors.toMap(
                                campaign -> campaign.getCampaignId().getCampaignId(),
                                campaign -> campaign
                        ));

        List<String> advertiserBusinessIds = campaignById.values().stream()
                .map(campaign -> campaign.getBusinessId().getBusinessId())
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        Map<String, Business> advertiserBusinessById = advertiserBusinessIds.isEmpty()
                ? new HashMap<>()
                : businessRepository.findAllByBusinessId_BusinessIdIn(advertiserBusinessIds)
                        .stream()
                        .collect(java.util.stream.Collectors.toMap(
                                business -> business.getBusinessId().getBusinessId(),
                                business -> business,
                                (left, right) -> left,
                                HashMap::new
                        ));

        responses.forEach(response -> {
            if (response.getMediaId() != null && !response.getMediaId().isBlank()) {
                try {
                    UUID mediaId = UUID.fromString(response.getMediaId());
                    Media media = mediaById.get(mediaId);
                    if (media != null) {
                        response.setMediaTitle(media.getTitle());
                        if (media.getMediaLocation() != null) {
                            response.setMediaCity(media.getMediaLocation().getCity());
                        }
                    }
                } catch (IllegalArgumentException ignored) {
                    // Keep optional media enrichment fields null when media id is invalid.
                }
            }

            AdCampaign campaign = campaignById.get(response.getCampaignId());
            if (campaign == null) {
                return;
            }

            response.setCampaignName(campaign.getName());
            String advertiserBusinessId = campaign.getBusinessId().getBusinessId();
            response.setAdvertiserBusinessId(advertiserBusinessId);

            Business advertiserBusiness = advertiserBusinessById.get(advertiserBusinessId);
            if (advertiserBusiness != null) {
                response.setAdvertiserBusinessName(advertiserBusiness.getName());
            }
        });

        return responses;
    }

    @Override
    public List<ReservationResponseModel> getAllReservationByAdvertiserBusinessId(Jwt jwt, String businessId) {
        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, businessId);
        List<ReservationResponseModel> reservations = reservationRepository.findAll().stream().filter(reservation -> adCampaignRepository.findByCampaignId_CampaignId(reservation.getCampaignId()).getBusinessId().getBusinessId().equals(businessId)).map(reservationResponseMapper::entityToResponseModel).toList();

        List<String> campaignIds = reservations.stream()
                .map(ReservationResponseModel::getCampaignId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        var campaigns = adCampaignRepository.findAllByCampaignId_CampaignIdIn(campaignIds);

        var campaignNameById = campaigns.stream()
                .collect(java.util.stream.Collectors.toMap(
                        c -> c.getCampaignId().getCampaignId(),
                        AdCampaign::getName
                ));

        reservations.forEach(r -> r.setCampaignName(campaignNameById.get(r.getCampaignId())));

        return reservations;
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

    private Reservation createPendingReservation(ReservationRequestModel requestModel, Media media,
                                                 String userId, BigDecimal totalPrice) {
        log.info("Creating new PENDING reservation (no payment provided, webhook will confirm)");
        Reservation reservation = reservationRequestMapper.requestModelToEntity(requestModel);
        reservation.setReservationId(UUID.randomUUID().toString());
        reservation.setMediaId(media.getId());
        reservation.setTotalPrice(totalPrice);
        reservation.setAdvertiserId(userId);
        reservation.setStatus(ReservationStatus.PENDING); // Will be updated to APPROVED or DENIED by media owner, or CONFIRMED by payment webhook
        return reservation;
    }

}
