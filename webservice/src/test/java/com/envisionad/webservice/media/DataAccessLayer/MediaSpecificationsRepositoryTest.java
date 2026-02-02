package com.envisionad.webservice.media.DataAccessLayer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:spec-test-db",
        "spring.sql.init.mode=never"
})
class MediaSpecificationsRepositoryTest {

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private MediaLocationRepository mediaLocationRepository;

    @BeforeEach
    void setUp() {
        mediaRepository.deleteAll();
        mediaLocationRepository.deleteAll();

        UUID businessIdA = UUID.randomUUID();
        UUID businessIdB = UUID.randomUUID();



        // Create a location (required relation)
        MediaLocation location = new MediaLocation();
        location.setName("Test Location");
        location.setDescription("Test Desc");
        location.setCountry("Canada");
        location.setProvince("QC");
        location.setCity("Montreal");
        location.setStreet("123 Test St");
        location.setPostalCode("H1H 1H1");
        location.setLatitude(45.0);
        location.setLongitude(-73.0);
        mediaLocationRepository.save(location);

        // Media 1: Active, "Digital Board", Price 100, Imp 1000
        Media m1 = new Media();
        m1.setMediaLocation(location);
        m1.setTitle("Digital Board");
        m1.setMediaOwnerName("Owner A");
        m1.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        m1.setStatus(Status.ACTIVE);
        m1.setPrice(new BigDecimal("100.00"));
        m1.setDailyImpressions(1000);
        m1.setResolution("1920x1080");
        m1.setBusinessId(businessIdA);
        mediaRepository.save(m1);

        // Media 2: Inactive, "Poster Wall", Price 50, Imp 500
        Media m2 = new Media();
        m2.setMediaLocation(location);
        m2.setTitle("Poster Wall");
        m2.setMediaOwnerName("Owner B");
        m2.setTypeOfDisplay(TypeOfDisplay.POSTER);
        m2.setStatus(Status.INACTIVE);
        m2.setPrice(new BigDecimal("50.00"));
        m2.setDailyImpressions(500);
        m2.setBusinessId(businessIdB);
        mediaRepository.save(m2);

        // Media 3: Active, "Big Digital Screen", Price 200, Imp 2000
        Media m3 = new Media();
        m3.setMediaLocation(location);
        m3.setTitle("Big Digital Screen");
        m3.setMediaOwnerName("Owner A");
        m3.setTypeOfDisplay(TypeOfDisplay.DIGITAL);
        m3.setStatus(Status.ACTIVE);
        m3.setPrice(new BigDecimal("200.00"));
        m3.setDailyImpressions(2000);
        m3.setBusinessId(businessIdA);
        mediaRepository.save(m3);
    }

    @Test
    void hasStatus_ShouldFilterByStatus() {
        Specification<Media> spec = MediaSpecifications.hasStatus(Status.ACTIVE);
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(2, results.size());
        assertTrue(results.stream().allMatch(m -> m.getStatus() == Status.ACTIVE));
    }

    @Test
    void titleContains_ShouldFilterByTitle() {
        Specification<Media> spec = MediaSpecifications.titleContains("Digital");
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(2, results.size()); // "Digital Board", "Big Digital Screen"
        assertTrue(results.stream().allMatch(m -> m.getTitle().contains("Digital")));
    }

    @Test
    void titleContains_ShouldBeCaseInsensitive() {
        Specification<Media> spec = MediaSpecifications.titleContains("digital");
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(2, results.size());
    }

    @Test
    void priceBetween_ShouldFilterRange() {
        // Between 80 and 250 (should include 100 and 200, exclude 50)
        Specification<Media> spec = MediaSpecifications.priceBetween(new BigDecimal("80.00"), new BigDecimal("250.00"));
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(2, results.size());
        assertTrue(results.stream().noneMatch(m -> m.getPrice().compareTo(new BigDecimal("50.00")) == 0));
    }

    @Test
    void priceBetween_MinPriceOnly() {
        // >= 150 (should include 200 only)
        Specification<Media> spec = MediaSpecifications.priceBetween(new BigDecimal("150.00"), null);
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(1, results.size());
        assertEquals(new BigDecimal("200.00"), results.get(0).getPrice());
    }

    @Test
    void priceBetween_MaxPriceOnly() {
        // <= 80 (should include 50 only)
        Specification<Media> spec = MediaSpecifications.priceBetween(null, new BigDecimal("80.00"));
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(1, results.size());
        assertEquals(new BigDecimal("50.00"), results.get(0).getPrice());
    }

    @Test
    void dailyImpressionsGreaterThan_ShouldFilter() {
        // >= 1000 (should include 1000 and 2000)
        Specification<Media> spec = MediaSpecifications.dailyImpressionsGreaterThan(1000);
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(2, results.size());
    }

    @Test
    void combinedSpecifications_ShouldFilterCorrectly() {
        // Active AND Title contains "Digital" (should be 2) AND Price > 150 (should be
        // 1: "Big Digital Screen")
        Specification<Media> spec = MediaSpecifications.hasStatus(Status.ACTIVE)
                .and(MediaSpecifications.titleContains("Digital"))
                .and(MediaSpecifications.priceBetween(new BigDecimal("150.00"), null));

        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(1, results.size());
        assertEquals("Big Digital Screen", results.get(0).getTitle());
    }

    @Test
    void businessIdEquals_ShouldFilterCorrectly() {
        UUID businessId = mediaRepository.findAll().get(0).getBusinessId();

        Specification<Media> spec = MediaSpecifications.businessIdEquals(businessId);
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(2, results.size());
        assertTrue(results.stream().allMatch(m -> m.getBusinessId().equals(businessId)));
    }

    @Test
    void mediaIdIsNotEqual_ShouldExcludeOneMedia() {
        Media excluded = mediaRepository.findAll().get(0);

        Specification<Media> spec = MediaSpecifications.mediaIdIsNotEqual(excluded.getId());
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(2, results.size());
        assertTrue(results.stream().noneMatch(m -> m.getId().equals(excluded.getId())));
    }

    @Test
    void withinBounds_ShouldIncludeAllMediaInsideBounds() {
        List<Double> bounds = new ArrayList<>();
        bounds.add(40.0);
        bounds.add(50.0);
        bounds.add(-80.0);
        bounds.add(-70.0);

        Specification<Media> spec = MediaSpecifications.withinBounds(bounds);
        List<Media> results = mediaRepository.findAll(spec);

        assertEquals(3, results.size());
    }
}
