package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.advertisement.exceptions.AdCampaignNotFoundException;
import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;
import com.envisionad.webservice.media.exceptions.MediaNotFoundException;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationStatus;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationRequestMapper;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationResponseMapper;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationRequestModel;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final MediaRepository mediaRepository; // We need this to get the Price
    private final AdCampaignRepository adCampaignRepository; // To link the campaign
    private final ReservationRequestMapper reservationRequestMapper;
    private final ReservationResponseMapper reservationResponseMapper;

    public ReservationServiceImpl(ReservationRepository reservationRepository, MediaRepository mediaRepository, AdCampaignRepository adCampaignRepository, ReservationRequestMapper reservationRequestMapper, ReservationResponseMapper reservationResponseMapper) {
        this.reservationRepository = reservationRepository;
        this.mediaRepository = mediaRepository;
        this.adCampaignRepository = adCampaignRepository;
        this.reservationRequestMapper = reservationRequestMapper;
        this.reservationResponseMapper = reservationResponseMapper;
    }

    @Override
    public List<ReservationResponseModel> getAllReservations() {
        String currentAdvertiserId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Reservation> reservations = reservationRepository.findByAdvertiserId(currentAdvertiserId);
        return reservationResponseMapper.entitiesToResponseModelList(reservations);
    }

    @Override
    public ReservationResponseModel createReservation(ReservationRequestModel request) {

        String currentAdvertiserId = SecurityContextHolder.getContext().getAuthentication().getName();

        String mediaId = request.getMediaId();
        Media media = mediaRepository.findById(UUID.fromString(mediaId))
                .orElseThrow(() -> new MediaNotFoundException(mediaId));

        AdCampaign campaign = adCampaignRepository.findByCampaignId_CampaignId(request.getCampaignId());
        if (campaign == null) {
            throw new AdCampaignNotFoundException(request.getCampaignId());
        }

        long days = Duration.between(request.getStartDate(), request.getEndDate()).toDays();
        double weeks = Math.max(1.0, Math.ceil(days / 7.0));
        Double totalPrice = (media.getPrice() != null ? media.getPrice().doubleValue() : 0.0) * weeks;

        Reservation reservation = reservationRequestMapper.requestModelToEntity(request);
        reservation.setReservationId(java.util.UUID.randomUUID().toString());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setAdvertiserId(currentAdvertiserId);

        return reservationResponseMapper.entityToResponseModel(reservationRepository.save(reservation));
    }

}