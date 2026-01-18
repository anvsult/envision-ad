package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final MediaRepository mediaRepository; // We need this to get the Price
    private final AdCampaignRepository adCampaignRepository; // To link the campaign
    private final ReservationRequestMapper reservationRequestMapper;
    private final ReservationResponseMapper reservationResponseMapper;
    private final EmployeeRepository employeeRepository;

    public ReservationServiceImpl(ReservationRepository reservationRepository, MediaRepository mediaRepository, AdCampaignRepository adCampaignRepository, ReservationRequestMapper reservationRequestMapper, ReservationResponseMapper reservationResponseMapper, EmployeeRepository employeeRepository) {
        this.reservationRepository = reservationRepository;
        this.mediaRepository = mediaRepository;
        this.adCampaignRepository = adCampaignRepository;
        this.reservationRequestMapper = reservationRequestMapper;
        this.reservationResponseMapper = reservationResponseMapper;
        this.employeeRepository = employeeRepository;
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

        String userId = extractUserId(jwt);

        // Validate media exists
        Media media = mediaRepository.findById(UUID.fromString(mediaId))
                .orElseThrow(() -> new MediaNotFoundException(mediaId));

        // Validate campaign exists and user has access
        AdCampaign campaign = adCampaignRepository.findByCampaignId_CampaignId(requestModel.getCampaignId());
        if (campaign == null) {
            throw new AdCampaignNotFoundException(requestModel.getCampaignId());
        }

        // Validate that the user is an employee of the business that owns the campaign
        String businessId = campaign.getBusinessId().getBusinessId();

        // Validate user is employee of the business
        validateUserIsEmployeeOfBusiness(userId, businessId);

        // Validate business owns the campaign
        validateBusinessOwnsCampaign(businessId, requestModel.getCampaignId());

        // Calculate price
        long days = Duration.between(requestModel.getStartDate(), requestModel.getEndDate()).toDays();
        int weeks = (int)Math.max(1, Math.ceil(days / 7.0));
        Double totalPrice = (media.getPrice() != null ? media.getPrice().doubleValue() : 0.0) * weeks;

        // Create and populate reservation
        Reservation reservation = reservationRequestMapper.requestModelToEntity(requestModel);
        reservation.setReservationId(UUID.randomUUID().toString());
        reservation.setMediaId(media.getId());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setAdvertiserId(userId);

        return reservationResponseMapper.entityToResponseModel(reservationRepository.save(reservation));
    }

    private void validateUserIsEmployeeOfBusiness(String userId, String businessId) {
        boolean isEmployee = employeeRepository.existsByUserIdAndBusinessId_BusinessId(userId, businessId);
        if (!isEmployee)
            throw new AccessDeniedException("User is not an employee of the business");
    }

    private void validateBusinessOwnsCampaign(String businessId, String campaignId) {
        AdCampaign campaign = adCampaignRepository.findByCampaignId_CampaignId(campaignId);
        if (campaign == null) {
            throw new AdCampaignNotFoundException(campaignId);
        }

        String campaignBusinessId = campaign.getBusinessId().getBusinessId();
        if (!campaignBusinessId.equals(businessId)) {
            throw new AccessDeniedException("Campaign does not belong to the specified business");
        }
    }

    private String extractUserId(Jwt jwt) {
        String userId = jwt.getClaim("sub");
        if (userId == null || userId.isEmpty())
            throw new org.springframework.security.access.AccessDeniedException("Invalid token");
        return userId;
    }

}