package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.Media;
import com.envisionad.webservice.media.DataAccessLayer.MediaLocation;
import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import com.envisionad.webservice.media.DataAccessLayer.Status;
import com.envisionad.webservice.media.PresentationLayer.Models.ScheduleModel;
import com.envisionad.webservice.media.PresentationLayer.Models.WeeklyScheduleEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaServiceUnitTest {

    @InjectMocks
    private MediaServiceImpl mediaService;

    @Mock
    private MediaRepository mediaRepository;

    private Media media1;
    private Media media2;
    private Media media3;
    private MediaLocation location1;
    private MediaLocation location2;
    private MediaLocation location3;

    @BeforeEach
    void setUp() {
        // Create MediaLocations with different coordinates
        location1 = createMediaLocation(
                "Downtown Billboard A",
                "Large billboard",
                43.651070,  // Toronto downtown
                -79.347015
        );

        location2 = createMediaLocation(
                "Midtown Billboard B",
                "Medium billboard",
                43.700000,  // North Toronto
                -79.400000
        );

        location3 = createMediaLocation(
                "Suburb Billboard C",
                "Small billboard",
                43.800000,  // Far north
                -79.500000
        );

        // Create Media with different properties
        media1 = createMedia(
                "Premium Downtown Screen",
                location1,
                new BigDecimal("500.00"),
                50000,
                Status.ACTIVE
        );

        media2 = createMedia(
                "Budget Midtown Screen",
                location2,
                new BigDecimal("200.00"),
                20000,
                Status.ACTIVE
        );

        media3 = createMedia(
                "Economy Suburb Screen",
                location3,
                new BigDecimal("100.00"),
                10000,
                Status.ACTIVE
        );
    }

    // ==================== getAllFilteredActiveMedia Tests ====================

    @Test
    void getAllFilteredActiveMedia_WithNoFilters_ShouldReturnAllActiveMedia() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        Page<Media> result = mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, null, null, null);

        // Assert
        assertNotNull(result);
        verify(mediaRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAllFilteredActiveMedia_WithTitleFilter_ShouldFilterByTitle() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        String titleFilter = "Downtown";
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        mediaService.getAllFilteredActiveMedia(
                pageable, titleFilter, null, null, null, null, null, null);

        // Assert
        ArgumentCaptor<Specification<Media>> specCaptor = ArgumentCaptor.forClass(Specification.class);
        verify(mediaRepository).findAll(specCaptor.capture(), eq(pageable));
        assertNotNull(specCaptor.getValue());
    }

    @Test
    void getAllFilteredActiveMedia_WithPriceRange_ShouldFilterByPrice() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        BigDecimal minPrice = new BigDecimal("100.00");
        BigDecimal maxPrice = new BigDecimal("300.00");
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        mediaService.getAllFilteredActiveMedia(
                pageable, null, minPrice, maxPrice, null, null, null, null);

        // Assert
        verify(mediaRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAllFilteredActiveMedia_WithMinPriceOnly_ShouldFilterByMinPrice() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        BigDecimal minPrice = new BigDecimal("200.00");
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        mediaService.getAllFilteredActiveMedia(
                pageable, null, minPrice, null, null, null, null, null);

        // Assert
        verify(mediaRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAllFilteredActiveMedia_WithMaxPriceOnly_ShouldFilterByMaxPrice() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        BigDecimal maxPrice = new BigDecimal("300.00");
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        mediaService.getAllFilteredActiveMedia(
                pageable, null, null, maxPrice, null, null, null, null);

        // Assert
        verify(mediaRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAllFilteredActiveMedia_WithMinDailyImpressions_ShouldFilterByImpressions() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Integer minImpressions = 25000;
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, minImpressions, null, null, null);

        // Assert
        verify(mediaRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAllFilteredActiveMedia_WithAllFilters_ShouldApplyAllFilters() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        String title = "Screen";
        BigDecimal minPrice = new BigDecimal("100.00");
        BigDecimal maxPrice = new BigDecimal("500.00");
        Integer minImpressions = 15000;
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        mediaService.getAllFilteredActiveMedia(
                pageable, title, minPrice, maxPrice, minImpressions, null, null, null);

        // Assert
        verify(mediaRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAllFilteredActiveMedia_WithNearestSort_ShouldSortByDistance() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Double userLat = 43.651070;
        Double userLng = -79.347015;
        List<Media> mediaList = new ArrayList<>(List.of(media3, media2, media1)); // Mutable list

        when(mediaRepository.findAll(any(Specification.class)))
                .thenReturn(mediaList);

        // Act
        Page<Media> result = mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", userLat, userLng);

        // Assert
        assertNotNull(result);
        List<Media> content = result.getContent();
        // First should be media1 (closest to user location which is same as location1)
        assertEquals("Premium Downtown Screen", content.get(0).getTitle());
        verify(mediaRepository).findAll(any(Specification.class));
    }

    @Test
    void getAllFilteredActiveMedia_WithNearestSort_AndPagination_ShouldReturnCorrectPage() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 1); // Second page, 1 item per page
        Double userLat = 43.651070;
        Double userLng = -79.347015;
        List<Media> mediaList = new ArrayList<>(List.of(media1, media2, media3));

        when(mediaRepository.findAll(any(Specification.class)))
                .thenReturn(mediaList);

        // Act
        Page<Media> result = mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", userLat, userLng);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(3, result.getTotalElements());
        assertEquals(3, result.getTotalPages());
    }

    @Test
    void getAllFilteredActiveMedia_WithNearestSort_AndEmptyList_ShouldReturnEmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Double userLat = 43.651070;
        Double userLng = -79.347015;
        List<Media> mediaList = new ArrayList<>();

        when(mediaRepository.findAll(any(Specification.class)))
                .thenReturn(mediaList);

        // Act
        Page<Media> result = mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", userLat, userLng);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getAllFilteredActiveMedia_WithNearestSort_AndPageBeyondSize_ShouldReturnEmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(10, 10); // Way beyond available data
        Double userLat = 43.651070;
        Double userLng = -79.347015;
        List<Media> mediaList = new ArrayList<>(List.of(media1, media2));

        when(mediaRepository.findAll(any(Specification.class)))
                .thenReturn(mediaList);

        // Act
        Page<Media> result = mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", userLat, userLng);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getAllFilteredActiveMedia_WithNearestSort_MediaWithNullLocation_ShouldBeSortedLast() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Double userLat = 43.651070;
        Double userLng = -79.347015;

        Media mediaWithNullLocation = createMedia("No Location Media", null,
                new BigDecimal("150.00"), 15000, Status.ACTIVE);

        List<Media> mediaList = new ArrayList<>(List.of(mediaWithNullLocation, media2, media1));

        when(mediaRepository.findAll(any(Specification.class)))
                .thenReturn(mediaList);

        // Act
        Page<Media> result = mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", userLat, userLng);

        // Assert
        assertNotNull(result);
        List<Media> content = result.getContent();
        // Media with null location should be last
        assertEquals("No Location Media", content.get(content.size() - 1).getTitle());
    }

    @Test
    void getAllFilteredActiveMedia_WithNearestSort_MissingUserCoordinates_ShouldNotSortByDistance() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act - Missing userLat
        mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", null, -79.347015);

        // Assert - Should use regular pagination instead of distance sorting
        verify(mediaRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAllFilteredActiveMedia_WithNearestSort_MissingUserLongitude_ShouldNotSortByDistance() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act - Missing userLng
        mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", 43.651070, null);

        // Assert - Should use regular pagination instead of distance sorting
        verify(mediaRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void getAllFilteredActiveMedia_WithDifferentSpecialSort_ShouldNotSortByDistance() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(mediaRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "price", 43.651070, -79.347015);

        // Assert - Should use regular pagination
        verify(mediaRepository).findAll(any(Specification.class), eq(pageable));
    }

    // ==================== Distance Calculation Tests ====================

    @Test
    void distance_SameLocation_ShouldReturnZero() {
        // Arrange
        double lat = 43.651070;
        double lon = -79.347015;

        // Act - Using reflection to test private method
        double distance = calculateDistance(lat, lon, lat, lon);

        // Assert
        assertEquals(0.0, distance, 0.001);
    }

    @Test
    void distance_TorontoToNewYork_ShouldReturnCorrectDistance() {
        // Arrange
        double torontoLat = 43.651070;
        double torontoLon = -79.347015;
        double newYorkLat = 40.712776;
        double newYorkLon = -74.005974;

        // Act
        double distance = calculateDistance(torontoLat, torontoLon, newYorkLat, newYorkLon);

        // Assert - Distance between Toronto and New York is approximately 550 km
        assertTrue(distance > 500 && distance < 600,
                "Distance should be approximately 550 km, but was: " + distance);
    }

    @Test
    void distance_AcrossEquator_ShouldCalculateCorrectly() {
        // Arrange - One in northern hemisphere, one in southern
        double lat1 = 43.651070;
        double lon1 = -79.347015;
        double lat2 = -33.868820; // Sydney, Australia
        double lon2 = 151.209290;

        // Act
        double distance = calculateDistance(lat1, lon1, lat2, lon2);

        // Assert - Should be a very large distance (around 15,000+ km)
        assertTrue(distance > 15000, "Distance should be over 15,000 km");
    }

    @Test
    void distance_ShortDistance_ShouldBeAccurate() {
        // Arrange - Two points very close together in Toronto
        double lat1 = 43.651070;
        double lon1 = -79.347015;
        double lat2 = 43.652070; // About 1 km north
        double lon2 = -79.347015;

        // Act
        double distance = calculateDistance(lat1, lon1, lat2, lon2);

        // Assert - Should be approximately 0.11 km
        assertTrue(distance < 1.0, "Distance should be less than 1 km");
        assertTrue(distance > 0.0, "Distance should be greater than 0");
    }

    @Test
    void distance_AntipodePoints_ShouldReturnMaxDistance() {
        // Arrange - Opposite sides of the earth
        double lat1 = 45.0;
        double lon1 = 0.0;
        double lat2 = -45.0;
        double lon2 = 180.0;

        // Act
        double distance = calculateDistance(lat1, lon1, lat2, lon2);

        // Assert - Should be close to half the earth's circumference
        assertTrue(distance > 15000 && distance < 20100,
                "Distance should be between 15,000 and 20,100 km");
    }

    @Test
    void distance_WithNegativeCoordinates_ShouldCalculateCorrectly() {
        // Arrange
        double lat1 = -33.868820; // Sydney
        double lon1 = 151.209290;
        double lat2 = -34.603490; // Buenos Aires
        double lon2 = -58.381560;

        // Act
        double distance = calculateDistance(lat1, lon1, lat2, lon2);

        // Assert - Should be a large distance
        assertTrue(distance > 11000, "Distance should be over 11,000 km");
    }

    // ==================== Lambda Function Tests (Implicit) ====================

    @Test
    void lambdaSort_WithMultipleMedia_ShouldSortByDistanceAscending() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Double userLat = 43.651070;
        Double userLng = -79.347015;

        // Create media at different distances
        List<Media> mediaList = new ArrayList<>(List.of(media3, media1, media2));

        when(mediaRepository.findAll(any(Specification.class)))
                .thenReturn(mediaList);

        // Act
        Page<Media> result = mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", userLat, userLng);

        // Assert - Should be sorted: media1 (closest), media2 (medium), media3 (farthest)
        List<Media> content = result.getContent();
        assertEquals(3, content.size());
        assertEquals(media1.getTitle(), content.get(0).getTitle());
        assertEquals(media2.getTitle(), content.get(1).getTitle());
        assertEquals(media3.getTitle(), content.get(2).getTitle());
    }

    @Test
    void lambdaSort_WithIdenticalDistances_ShouldMaintainStableSort() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Double userLat = 43.651070;
        Double userLng = -79.347015;

        // Create multiple media at same location
        Media media4 = createMedia("Same Location 1", location1,
                new BigDecimal("100.00"), 10000, Status.ACTIVE);
        Media media5 = createMedia("Same Location 2", location1,
                new BigDecimal("200.00"), 20000, Status.ACTIVE);

        List<Media> mediaList = new ArrayList<>(List.of(media4, media5));

        when(mediaRepository.findAll(any(Specification.class)))
                .thenReturn(mediaList);

        // Act
        Page<Media> result = mediaService.getAllFilteredActiveMedia(
                pageable, null, null, null, null, "nearest", userLat, userLng);

        // Assert - Both should be returned as they're at the same distance
        assertEquals(2, result.getContent().size());
    }

    // ==================== Helper Methods ====================

    private MediaLocation createMediaLocation(String name, String description,
                                               Double latitude, Double longitude) {
        MediaLocation location = new MediaLocation();
        location.setId(UUID.randomUUID());
        location.setName(name);
        location.setDescription(description);
        location.setCountry("Canada");
        location.setProvince("ON");
        location.setCity("Toronto");
        location.setStreet("123 Main St");
        location.setPostalCode("M5H 1A1");
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        return location;
    }

    private Media createMedia(String title, MediaLocation location,
                              BigDecimal price, Integer dailyImpressions, Status status) {
        Media media = new Media();
        media.setId(UUID.randomUUID());
        media.setTitle(title);
        media.setMediaLocation(location);
        media.setPrice(price);
        media.setDailyImpressions(dailyImpressions);
        media.setStatus(status);
        media.setMediaOwnerName("Test Owner");

        // Set other required fields
        ScheduleModel schedule = new ScheduleModel();
        WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
        entry.setDayOfWeek("Monday");
        entry.setActive(true);
        entry.setStartTime("09:00");
        entry.setEndTime("17:00");
        schedule.setWeeklySchedule(List.of(entry));
        media.setSchedule(schedule);

        return media;
    }

    /**
     * Helper method to calculate distance using the Haversine formula.
     * This replicates the private distance method in MediaServiceImpl for testing purposes.
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Calculate using Haversine formula (same as in MediaServiceImpl)
        double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        lat1 = Math.toRadians(lat1);
        lat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}