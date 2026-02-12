package com.envisionad.webservice.media.PresentationLayer;

import com.envisionad.webservice.media.BusinessLayer.MediaService;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.DataAccessLayer.TypeOfDisplay;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaLocationResponseModel;
import com.envisionad.webservice.media.PresentationLayer.Models.MediaResponseModel;
import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = BusinessMediaController.class)
class BusinessMediaControllerUnitTest {

    @MockitoBean
    private MediaService mediaService;

    @Autowired
    private BusinessMediaController businessMediaController;

    private String businessId;
    private UUID mediaId1;
    private UUID mediaId2;
    private MediaResponseModel responseModel1;
    private MediaResponseModel responseModel2;
    private Jwt mockJwt;

    @BeforeEach
    void setUp() {
        businessId = UUID.randomUUID().toString();
        UUID mediaLocationId = UUID.randomUUID();
        mediaId1 = UUID.randomUUID();
        mediaId2 = UUID.randomUUID();

        // Create mock JWT
        mockJwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("sub", "auth0|test-user-id")
                .claim("scope", "read write")
                .claim("permissions", List.of("read:media"))
                .build();

        // Create media location response model
        MediaLocationResponseModel mediaLocationResponseModel = new MediaLocationResponseModel();
        mediaLocationResponseModel.setId(mediaLocationId);
        mediaLocationResponseModel.setName("Test Location");
        mediaLocationResponseModel.setDescription("Test Description");
        mediaLocationResponseModel.setCountry("Canada");
        mediaLocationResponseModel.setProvince("ON");
        mediaLocationResponseModel.setCity("Toronto");
        mediaLocationResponseModel.setStreet("123 Test St");
        mediaLocationResponseModel.setPostalCode("M5H 1A1");
        mediaLocationResponseModel.setLatitude(43.651070);
        mediaLocationResponseModel.setLongitude(-79.347015);

        // Create schedule
        ScheduleModel schedule = new ScheduleModel();
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("09:00");
        entry.setEndTime("17:00");
        schedule.setWeeklySchedule(List.of(entry));

        // Create first media response model
        responseModel1 = new MediaResponseModel();
        responseModel1.setId(mediaId1);
        responseModel1.setBusinessId(businessId);
        responseModel1.setTitle("Test Media 1");
        responseModel1.setMediaOwnerName("Test Owner");
        responseModel1.setMediaLocation(mediaLocationResponseModel);
        responseModel1.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        responseModel1.setPrice(new BigDecimal("150.00"));
        responseModel1.setStatus(Status.ACTIVE);
        responseModel1.setResolution("1920x1080");
        responseModel1.setAspectRatio("16:9");
        responseModel1.setLoopDuration(30);
        responseModel1.setDailyImpressions(25000);
        responseModel1.setSchedule(schedule);
        responseModel1.setImageUrl("http://example.com/image1.jpg");
        responseModel1.setPreviewConfiguration("{\"corners\": []}");

        // Create second media response model
        responseModel2 = new MediaResponseModel();
        responseModel2.setId(mediaId2);
        responseModel2.setBusinessId(businessId);
        responseModel2.setTitle("Test Media 2");
        responseModel2.setMediaOwnerName("Test Owner");
        responseModel2.setMediaLocation(mediaLocationResponseModel);
        responseModel2.setTypeOfDisplay(TypeOfDisplay.POSTER);
        responseModel2.setPrice(new BigDecimal("200.00"));
        responseModel2.setStatus(Status.ACTIVE);
        responseModel2.setResolution("1080x1920");
        responseModel2.setAspectRatio("9:16");
        responseModel2.setLoopDuration(null);
        responseModel2.setDailyImpressions(30000);
        responseModel2.setSchedule(schedule);
        responseModel2.setImageUrl("http://example.com/image2.jpg");
        responseModel2.setPreviewConfiguration("{\"corners\": []}");
    }

    @Test
    void getMediaByBusinessId_WithValidBusinessId_ShouldReturnListOfMedia() {
        // Arrange
        List<MediaResponseModel> expectedList = List.of(responseModel1, responseModel2);
        when(mediaService.getMediaByBusinessId(mockJwt, businessId)).thenReturn(expectedList);

        // Act
        ResponseEntity<List<MediaResponseModel>> response =
            businessMediaController.getMediaByBusinessId(mockJwt, businessId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals(mediaId1, response.getBody().get(0).getId());
        assertEquals(mediaId2, response.getBody().get(1).getId());
        assertEquals(businessId, response.getBody().get(0).getBusinessId());
        assertEquals(businessId, response.getBody().get(1).getBusinessId());
        assertEquals("Test Media 1", response.getBody().get(0).getTitle());
        assertEquals("Test Media 2", response.getBody().get(1).getTitle());

        verify(mediaService, times(1)).getMediaByBusinessId(mockJwt, businessId);
    }

    @Test
    void getMediaByBusinessId_WithEmptyMediaList_ShouldReturnEmptyList() {
        // Arrange
        List<MediaResponseModel> emptyList = new ArrayList<>();
        when(mediaService.getMediaByBusinessId(mockJwt, businessId)).thenReturn(emptyList);

        // Act
        ResponseEntity<List<MediaResponseModel>> response =
            businessMediaController.getMediaByBusinessId(mockJwt, businessId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        verify(mediaService, times(1)).getMediaByBusinessId(mockJwt, businessId);
    }

    @Test
    void getMediaByBusinessId_WithSingleMedia_ShouldReturnSingleElementList() {
        // Arrange
        List<MediaResponseModel> singleList = List.of(responseModel1);
        when(mediaService.getMediaByBusinessId(mockJwt, businessId)).thenReturn(singleList);

        // Act
        ResponseEntity<List<MediaResponseModel>> response =
            businessMediaController.getMediaByBusinessId(mockJwt, businessId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(mediaId1, response.getBody().getFirst().getId());
        assertEquals("Test Media 1", response.getBody().getFirst().getTitle());

        verify(mediaService, times(1)).getMediaByBusinessId(mockJwt, businessId);
    }

    @Test
    void getMediaByBusinessId_WithInvalidBusinessId_ShouldThrowException() {
        // Arrange
        String invalidBusinessId = "invalid-uuid";
        when(mediaService.getMediaByBusinessId(mockJwt, invalidBusinessId))
                .thenThrow(new IllegalArgumentException("Invalid businessId format: " + invalidBusinessId));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> businessMediaController.getMediaByBusinessId(mockJwt, invalidBusinessId));

        assertEquals("Invalid businessId format: invalid-uuid", exception.getMessage());
        verify(mediaService, times(1)).getMediaByBusinessId(mockJwt, invalidBusinessId);
    }

    @Test
    void getMediaByBusinessId_WithNonExistentBusinessId_ShouldThrowException() {
        // Arrange
        String nonExistentBusinessId = UUID.randomUUID().toString();
        when(mediaService.getMediaByBusinessId(mockJwt, nonExistentBusinessId))
                .thenThrow(new IllegalArgumentException("Business with ID " + nonExistentBusinessId + " does not exist."));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> businessMediaController.getMediaByBusinessId(mockJwt, nonExistentBusinessId));

        assertTrue(exception.getMessage().contains("does not exist"));
        verify(mediaService, times(1)).getMediaByBusinessId(mockJwt, nonExistentBusinessId);
    }

    @Test
    void getMediaByBusinessId_ServiceReturnsNull_ShouldHandleGracefully() {
        // Arrange
        when(mediaService.getMediaByBusinessId(mockJwt, businessId)).thenReturn(null);

        // Act
        ResponseEntity<List<MediaResponseModel>> response =
            businessMediaController.getMediaByBusinessId(mockJwt, businessId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody());

        verify(mediaService, times(1)).getMediaByBusinessId(mockJwt, businessId);
    }

    @Test
    void getMediaByBusinessId_WithMultipleMediaTypes_ShouldReturnAll() {
        // Arrange
        MediaResponseModel digitalMedia = new MediaResponseModel();
        digitalMedia.setId(UUID.randomUUID());
        digitalMedia.setBusinessId(businessId);
        digitalMedia.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        digitalMedia.setTitle("Digital Media");

        MediaResponseModel posterMedia = new MediaResponseModel();
        posterMedia.setId(UUID.randomUUID());
        posterMedia.setBusinessId(businessId);
        posterMedia.setTypeOfDisplay(TypeOfDisplay.POSTER);
        posterMedia.setTitle("Poster Media");

        List<MediaResponseModel> mixedList = List.of(digitalMedia, posterMedia);
        when(mediaService.getMediaByBusinessId(mockJwt, businessId)).thenReturn(mixedList);

        // Act
        ResponseEntity<List<MediaResponseModel>> response =
            businessMediaController.getMediaByBusinessId(mockJwt, businessId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals(TypeOfDisplay.DIGITAL, response.getBody().get(0).getTypeOfDisplay());
        assertEquals(TypeOfDisplay.POSTER, response.getBody().get(1).getTypeOfDisplay());

        verify(mediaService, times(1)).getMediaByBusinessId(mockJwt, businessId);
    }

    @Test
    void getMediaByBusinessId_VerifyJwtIsPassed_ShouldPassCorrectJwtToService() {
        // Arrange
        List<MediaResponseModel> expectedList = List.of(responseModel1);
        when(mediaService.getMediaByBusinessId(mockJwt, businessId)).thenReturn(expectedList);

        // Act
        businessMediaController.getMediaByBusinessId(mockJwt, businessId);

        // Assert - Verify that the exact JWT instance was passed
        verify(mediaService, times(1)).getMediaByBusinessId(eq(mockJwt), eq(businessId));
    }

    @Test
    void getMediaByBusinessId_VerifyBusinessIdIsPassed_ShouldPassCorrectBusinessIdToService() {
        // Arrange
        String specificBusinessId = UUID.randomUUID().toString();
        List<MediaResponseModel> expectedList = List.of(responseModel1);
        when(mediaService.getMediaByBusinessId(mockJwt, specificBusinessId)).thenReturn(expectedList);

        // Act
        businessMediaController.getMediaByBusinessId(mockJwt, specificBusinessId);

        // Assert - Verify that the exact businessId was passed
        verify(mediaService, times(1)).getMediaByBusinessId(any(Jwt.class), eq(specificBusinessId));
    }
}

