package com.envisionad.webservice.reservation.businesslogiclayer;

import com.envisionad.webservice.advertisement.businesslogiclayer.AdCampaignService;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignIdentifier;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaignRepository;
import com.envisionad.webservice.business.dataaccesslayer.EmployeeRepository;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.reservation.dataaccesslayer.Reservation;
import com.envisionad.webservice.reservation.dataaccesslayer.ReservationRepository;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationRequestMapper;
import com.envisionad.webservice.reservation.datamapperlayer.ReservationResponseMapper;
import com.envisionad.webservice.reservation.presentationlayer.models.ReservationResponseModel;
import com.envisionad.webservice.utils.EmailService;
import com.envisionad.webservice.utils.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceImplUnitTest {

    @Mock private EmailService emailService;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private MediaRepository mediaRepository;
    @Mock private AdCampaignRepository adCampaignRepository;
    @Mock private ReservationRequestMapper reservationRequestMapper;
    @Mock private ReservationResponseMapper reservationResponseMapper;
    @Mock private AdCampaignService adCampaignService;
    @Mock private JwtUtils jwtUtils;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    @Test
    void getAllReservationsByMediaId_populatesCampaignNames_whenCampaignsExist() {
        String mediaId = UUID.randomUUID().toString();

        Reservation r1 = mock(Reservation.class);
        when(r1.getCampaignId()).thenReturn("camp-1");
        Reservation r2 = mock(Reservation.class);
        when(r2.getCampaignId()).thenReturn("camp-2");
        List<Reservation> reservations = List.of(r1, r2);

        ReservationResponseModel rm1 = new ReservationResponseModel();
        rm1.setCampaignId("camp-1");
        ReservationResponseModel rm2 = new ReservationResponseModel();
        rm2.setCampaignId("camp-2");
        List<ReservationResponseModel> mapped = List.of(rm1, rm2);

        when(reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId)))
                .thenReturn(reservations);
        when(reservationResponseMapper.entitiesToResponseModelList(reservations))
                .thenReturn(mapped);

        AdCampaign c1 = mock(AdCampaign.class);
        AdCampaignIdentifier id1 = mock(AdCampaignIdentifier.class);
        when(id1.getCampaignId()).thenReturn("camp-1");
        when(c1.getCampaignId()).thenReturn(id1);
        when(c1.getName()).thenReturn("Winter Promo");

        AdCampaign c2 = mock(AdCampaign.class);
        AdCampaignIdentifier id2 = mock(AdCampaignIdentifier.class);
        when(id2.getCampaignId()).thenReturn("camp-2");
        when(c2.getCampaignId()).thenReturn(id2);
        when(c2.getName()).thenReturn("Spring Launch");

        when(adCampaignRepository.findAllByCampaignId_CampaignIdIn(List.of("camp-1", "camp-2")))
                .thenReturn(List.of(c1, c2));

        // Act
        List<ReservationResponseModel> result = reservationService.getAllReservationsByMediaId(mediaId);

        // Assert
        assertEquals(2, result.size());
        assertEquals("Winter Promo", result.get(0).getCampaignName());
        assertEquals("Spring Launch", result.get(1).getCampaignName());
    }

    @Test
    void getAllReservationsByMediaId_skipsNullOrBlankCampaignIds_andDoesNotCrash() {
        String mediaId = UUID.randomUUID().toString();

        Reservation r1 = mock(Reservation.class); when(r1.getCampaignId()).thenReturn(null);
        Reservation r2 = mock(Reservation.class); when(r2.getCampaignId()).thenReturn("");
        Reservation r3 = mock(Reservation.class); when(r3.getCampaignId()).thenReturn("   ");
        Reservation r4 = mock(Reservation.class); when(r4.getCampaignId()).thenReturn("camp-1");
        List<Reservation> reservations = List.of(r1, r2, r3, r4);

        ReservationResponseModel rm1 = new ReservationResponseModel(); rm1.setCampaignId(null);
        ReservationResponseModel rm2 = new ReservationResponseModel(); rm2.setCampaignId("");
        ReservationResponseModel rm3 = new ReservationResponseModel(); rm3.setCampaignId("   ");
        ReservationResponseModel rm4 = new ReservationResponseModel(); rm4.setCampaignId("camp-1");
        List<ReservationResponseModel> mapped = List.of(rm1, rm2, rm3, rm4);

        when(reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId)))
                .thenReturn(reservations);
        when(reservationResponseMapper.entitiesToResponseModelList(reservations))
                .thenReturn(mapped);

        AdCampaign c1 = mock(AdCampaign.class);
        AdCampaignIdentifier id1 = mock(AdCampaignIdentifier.class);
        when(id1.getCampaignId()).thenReturn("camp-1");
        when(c1.getCampaignId()).thenReturn(id1);
        when(c1.getName()).thenReturn("Only Valid Campaign");

        // Capture the list passed to the batch call to ensure only "camp-1" is fetched
        when(adCampaignRepository.findAllByCampaignId_CampaignIdIn(anyList()))
                .thenReturn(List.of(c1));

        // Act
        List<ReservationResponseModel> result = reservationService.getAllReservationsByMediaId(mediaId);

        // Assert (no crash + only valid one gets name)
        assertEquals(4, result.size());
        assertNull(result.get(0).getCampaignName());
        assertNull(result.get(1).getCampaignName());
        assertNull(result.get(2).getCampaignName());
        assertEquals("Only Valid Campaign", result.get(3).getCampaignName());

        ArgumentCaptor<List<String>> captor = ArgumentCaptor.forClass(List.class);
        verify(adCampaignRepository).findAllByCampaignId_CampaignIdIn(captor.capture());
        assertEquals(List.of("camp-1"), captor.getValue());
    }

    @Test
    void getAllReservationsByMediaId_campaignMissing_keepsCampaignNameNull_forThatReservation() {
        String mediaId = UUID.randomUUID().toString();

        Reservation r1 = mock(Reservation.class); when(r1.getCampaignId()).thenReturn("camp-1");
        Reservation r2 = mock(Reservation.class); when(r2.getCampaignId()).thenReturn("camp-missing");
        List<Reservation> reservations = List.of(r1, r2);

        ReservationResponseModel rm1 = new ReservationResponseModel(); rm1.setCampaignId("camp-1");
        ReservationResponseModel rm2 = new ReservationResponseModel(); rm2.setCampaignId("camp-missing");
        List<ReservationResponseModel> mapped = List.of(rm1, rm2);

        when(reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId)))
                .thenReturn(reservations);
        when(reservationResponseMapper.entitiesToResponseModelList(reservations))
                .thenReturn(mapped);

        AdCampaign c1 = mock(AdCampaign.class);
        AdCampaignIdentifier id1 = mock(AdCampaignIdentifier.class);
        when(id1.getCampaignId()).thenReturn("camp-1");
        when(c1.getCampaignId()).thenReturn(id1);
        when(c1.getName()).thenReturn("Found Campaign");

        when(adCampaignRepository.findAllByCampaignId_CampaignIdIn(anyList()))
                .thenReturn(List.of(c1)); // camp-missing not returned

        // Act
        List<ReservationResponseModel> result = reservationService.getAllReservationsByMediaId(mediaId);

        // Assert
        assertEquals("Found Campaign", result.get(0).getCampaignName());
        assertNull(result.get(1).getCampaignName());
    }

    @Test
    void getAllReservationsByMediaId_whenNoValidCampaignIds_doesNotCallBatchFetch() {
        String mediaId = UUID.randomUUID().toString();

        Reservation r1 = mock(Reservation.class); when(r1.getCampaignId()).thenReturn(null);
        Reservation r2 = mock(Reservation.class); when(r2.getCampaignId()).thenReturn("   ");
        List<Reservation> reservations = List.of(r1, r2);

        ReservationResponseModel rm1 = new ReservationResponseModel(); rm1.setCampaignId(null);
        ReservationResponseModel rm2 = new ReservationResponseModel(); rm2.setCampaignId("   ");
        List<ReservationResponseModel> mapped = List.of(rm1, rm2);

        when(reservationRepository.findAllReservationsByMediaId(UUID.fromString(mediaId)))
                .thenReturn(reservations);
        when(reservationResponseMapper.entitiesToResponseModelList(reservations))
                .thenReturn(mapped);

        // Act
        List<ReservationResponseModel> result = reservationService.getAllReservationsByMediaId(mediaId);

        // Assert
        assertEquals(2, result.size());
        verify(adCampaignRepository, never()).findAllByCampaignId_CampaignIdIn(anyList());
    }
}
