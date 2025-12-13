package com.envisionad.webservice.media.DataAccessLayer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class MediaSpecificationsTest {

    @Autowired
    private MediaRepository mediaRepository;

    private Media mediaActiveBillboard;
    private Media mediaInactiveBillboard;
    private Media mediaActivePoster;

    @BeforeEach
    void setUp() {
        mediaRepository.deleteAll();

        mediaActiveBillboard = new Media();
        mediaActiveBillboard.setTitle("Active Billboard");
        mediaActiveBillboard.setMediaOwnerName("Owner A");
        mediaActiveBillboard.setStatus(Status.ACTIVE);
        mediaActiveBillboard.setPrice(new BigDecimal("100.00"));
        mediaActiveBillboard.setDailyImpressions(1000);
        mediaRepository.save(mediaActiveBillboard);

        mediaInactiveBillboard = new Media();
        mediaInactiveBillboard.setTitle("Inactive Billboard");
        mediaInactiveBillboard.setMediaOwnerName("Owner A");
        mediaInactiveBillboard.setStatus(Status.INACTIVE);
        mediaInactiveBillboard.setPrice(new BigDecimal("200.00"));
        mediaInactiveBillboard.setDailyImpressions(2000);
        mediaRepository.save(mediaInactiveBillboard);

        mediaActivePoster = new Media();
        mediaActivePoster.setTitle("Small Poster");
        mediaActivePoster.setMediaOwnerName("Owner B");
        mediaActivePoster.setStatus(Status.ACTIVE);
        mediaActivePoster.setPrice(new BigDecimal("50.00"));
        mediaActivePoster.setDailyImpressions(500);
        mediaRepository.save(mediaActivePoster);
    }

    @Test
    void hasStatus_ShouldFilterByStatus() {
        List<Media> activeMedia = mediaRepository.findAll(MediaSpecifications.hasStatus(Status.ACTIVE));
        assertEquals(2, activeMedia.size());
        assertTrue(activeMedia.stream().anyMatch(m -> m.getTitle().equals("Active Billboard")));
        assertTrue(activeMedia.stream().anyMatch(m -> m.getTitle().equals("Small Poster")));

        List<Media> inactiveMedia = mediaRepository.findAll(MediaSpecifications.hasStatus(Status.INACTIVE));
        assertEquals(1, inactiveMedia.size());
        assertEquals("Inactive Billboard", inactiveMedia.get(0).getTitle());
    }

    @Test
    void hasStatus_NullStatus_ShouldReturnAll() {
        // Implementation of hasStatus returns (status == null ? null : ...).
        // Specification.where(null) basically means no filtering.
        List<Media> allMedia = mediaRepository.findAll(MediaSpecifications.hasStatus(null));
        assertEquals(3, allMedia.size());
    }

    @Test
    void titleContains_ShouldFilterByTitleCaseInsensitive() {
        List<Media> billboards = mediaRepository.findAll(MediaSpecifications.titleContains("Billboard"));
        assertEquals(2, billboards.size());

        List<Media> poster = mediaRepository.findAll(MediaSpecifications.titleContains("poster"));
        assertEquals(1, poster.size());
        assertEquals("Small Poster", poster.get(0).getTitle());
    }

    @Test
    void titleContains_NullOrBlank_ShouldReturnAll() {
        List<Media> allMedia = mediaRepository.findAll(MediaSpecifications.titleContains(null));
        assertEquals(3, allMedia.size());

        allMedia = mediaRepository.findAll(MediaSpecifications.titleContains("   "));
        assertEquals(3, allMedia.size());
    }

    @Test
    void priceBetween_ShouldFilterByRange() {
        List<Media> midPrice = mediaRepository
                .findAll(MediaSpecifications.priceBetween(new BigDecimal("80.00"), new BigDecimal("150.00")));
        assertEquals(1, midPrice.size());
        assertEquals("Active Billboard", midPrice.get(0).getTitle());
    }

    @Test
    void priceBetween_MinOnly_ShouldFilterGreaterThanOrEqualTo() {
        List<Media> expensive = mediaRepository
                .findAll(MediaSpecifications.priceBetween(new BigDecimal("150.00"), null));
        assertEquals(1, expensive.size());
        assertEquals("Inactive Billboard", expensive.get(0).getTitle());
    }

    @Test
    void priceBetween_MaxOnly_ShouldFilterLessThanOrEqualTo() {
        List<Media> cheap = mediaRepository.findAll(MediaSpecifications.priceBetween(null, new BigDecimal("100.00")));
        assertEquals(2, cheap.size()); // 50.00 and 100.00
    }

    @Test
    void priceBetween_Nulls_ShouldReturnAll() {
        List<Media> all = mediaRepository.findAll(MediaSpecifications.priceBetween(null, null));
        assertEquals(3, all.size());
    }

    @Test
    void dailyImpressionsGreaterThan_ShouldFilterMinImpressions() {
        List<Media> highImpact = mediaRepository.findAll(MediaSpecifications.dailyImpressionsGreaterThan(1500));
        assertEquals(1, highImpact.size());
        assertEquals("Inactive Billboard", highImpact.get(0).getTitle());

        List<Media> mediumImpact = mediaRepository.findAll(MediaSpecifications.dailyImpressionsGreaterThan(800));
        assertEquals(2, mediumImpact.size());
    }

    @Test
    void dailyImpressionsGreaterThan_Null_ShouldReturnAll() {
        List<Media> all = mediaRepository.findAll(MediaSpecifications.dailyImpressionsGreaterThan(null));
        assertEquals(3, all.size());
    }
}
