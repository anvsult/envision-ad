package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationRequestMapper;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationResponseMapper;
import com.envisionad.webservice.reservation.exceptions.*;
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
import java.util.List;
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

    public ReservationServiceImpl(ReservationRepository reservationRepository, MediaRepository mediaRepository,
                                  AdCampaignRepository adCampaignRepository, ReservationRequestMapper reservationRequestMapper,
                                  ReservationResponseMapper reservationResponseMapper, JwtUtils jwtUtils) {
        this.reservationRepository = reservationRepository;
        this.mediaRepository = mediaRepository;
        this.adCampaignRepository = adCampaignRepository;
        this.reservationRequestMapper = reservationRequestMapper;
        this.reservationResponseMapper = reservationResponseMapper;
        this.jwtUtils = jwtUtils;
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
    public ReservationResponseModel updateReservationStatus(Jwt jwt, String mediaId, String reservationId, ReservationStatus reservationStatus) {
        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, mediaRepository.findById(UUID.fromString(mediaId)).orElseThrow(() -> new MediaNotFoundException(mediaId)).getBusinessId().toString());

        Reservation reservation = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ReservationNotFoundException(reservationId));

        if (!reservation.getStatus().equals(ReservationStatus.PENDING)){
            throw new ReservationAlreadyProcessedException();
        }

        if (!reservationStatus.equals(ReservationStatus.APPROVED) && !reservationStatus.equals(ReservationStatus.DENIED)){
            throw new BadReservationRequestException();
        }

        reservation.setStatus(reservationStatus);
        reservationRepository.save(reservation);

        return reservationResponseMapper.entityToResponseModel(reservation);
    }

    @Override
    public List<ReservationResponseModel> getAllReservationByMediaOwnerBusinessId(Jwt jwt, String businessId) {
        jwtUtils.validateUserIsEmployeeOfBusiness(jwt, businessId);
        List<ReservationResponseModel> reservations = reservationRepository.findAll().stream().filter(reservation -> mediaRepository.findById(reservation.getMediaId()).stream().anyMatch(media -> media.getBusinessId().equals(UUID.fromString(businessId)))).map(reservationResponseMapper::entityToResponseModel).toList();

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

