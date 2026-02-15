package com.envisionad.webservice.media.DataAccessLayer;

import jakarta.persistence.criteria.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaSpecificationsTest {

    @Mock
    private Root<Media> root;
    @Mock
    private CriteriaQuery<?> query;
    @Mock
    private CriteriaBuilder cb;
    @Mock
    private Path<Object> path;
    @Mock
    private Path<String> titlePath;
    @Mock
    private Path<BigDecimal> pricePath;
    @Mock
    private Path<Integer> impressionsPath;
    @Mock
    private Path<Double> latitudePath;

    @Mock
    private Path<Double> longitudePath;
    @Mock
    private Predicate predicate;

    @Test
    void whenStatusProvided_thenReturnStatusPredicate() {
        Status status = Status.ACTIVE;

        when(root.get("status")).thenReturn(path);
        when(cb.equal(path, status)).thenReturn(predicate);

        Specification<Media> spec = MediaSpecifications.hasStatus(status);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(predicate, result);
        verify(cb).equal(path, status);
    }

    @Test
    void whenStatusIsNull_thenReturnNull() {
        Specification<Media> spec = MediaSpecifications.hasStatus(null);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNull(result);
        verifyNoInteractions(root, cb);
    }

    @Test
    void whenTitleProvided_thenReturnLikePredicate() {
        String title = "Banner";

        when(root.<String>get("title")).thenReturn(titlePath);
        when(cb.lower(titlePath)).thenReturn(titlePath);
        when(cb.like(titlePath, "%banner%")).thenReturn(predicate);

        Specification<Media> spec = MediaSpecifications.titleContains(title);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(predicate, result);
    }

    @Test
    void whenTitleIsBlank_thenReturnNull() {
        Specification<Media> spec = MediaSpecifications.titleContains("  ");

        Predicate result = spec.toPredicate(root, query, cb);

        assertNull(result);
        verifyNoInteractions(root, cb);
    }

    @Test
    void whenTitleIsNull_thenReturnNull() {
        Specification<Media> spec = MediaSpecifications.titleContains(null);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNull(result);
        verifyNoInteractions(root, cb);
    }

    @Test
    void whenBusinessIdEquals_thenReturnSpecification() {
        UUID businessId = UUID.randomUUID();

        // Mock behavior
        when(root.get("businessId")).thenReturn(path);
        when(cb.equal(path, businessId)).thenReturn(predicate);

        // Execute
        Specification<Media> spec = MediaSpecifications.businessIdEquals(businessId);
        Predicate result = spec.toPredicate(root, query, cb);

        // Verify
        assertNotNull(result);
        verify(root).get("businessId");
        verify(cb).equal(path, businessId);
    }

    @Test
    void whenBusinessIdIsNull_thenReturnNull() {
        // Execute
        Specification<Media> spec = MediaSpecifications.businessIdEquals(null);
        Predicate result = spec.toPredicate(root, query, cb);

        // Verify
        assertNull(result);
        verifyNoInteractions(root, cb);
    }

    @Test
    void whenMinAndMaxPriceProvided_thenReturnBetweenPredicate() {
        BigDecimal min = BigDecimal.valueOf(10);
        BigDecimal max = BigDecimal.valueOf(100);

        when(root.<BigDecimal>get("price")).thenReturn(pricePath);
        when(cb.between(pricePath, min, max)).thenReturn(predicate);

        Specification<Media> spec = MediaSpecifications.priceBetween(min, max);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(predicate, result);
    }

    @Test
    void whenOnlyMinPriceProvided_thenReturnGreaterThanPredicate() {
        BigDecimal min = BigDecimal.valueOf(50);

        when(root.<BigDecimal>get("price")).thenReturn(pricePath);
        when(cb.greaterThanOrEqualTo(pricePath, min)).thenReturn(predicate);

        Specification<Media> spec = MediaSpecifications.priceBetween(min, null);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(predicate, result);
    }

    @Test
    void whenOnlyMaxPriceProvided_thenReturnLessThanPredicate() {
        BigDecimal max = BigDecimal.valueOf(200);

        when(root.<BigDecimal>get("price")).thenReturn(pricePath);
        when(cb.lessThanOrEqualTo(pricePath, max)).thenReturn(predicate);

        Specification<Media> spec = MediaSpecifications.priceBetween(null, max);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(predicate, result);
    }

    @Test
    void whenBothPricesNull_thenReturnNull() {
        Specification<Media> spec = MediaSpecifications.priceBetween(null, null);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNull(result);
        verifyNoInteractions(root, cb);
    }

    @Test
    void whenMinWeeklyImpressionsProvided_thenReturnPredicate() {
        Integer min = 100;

        Path<Integer> dailyPath = mock(Path.class);
        Path<Integer> activeDaysPath = mock(Path.class);

        Expression<Integer> coalesceDaily = mock(Expression.class);
        Expression<Integer> coalesceActive = mock(Expression.class);
        Expression<Integer> weeklyExpression = mock(Expression.class);

        when(root.<Integer>get("dailyImpressions")).thenReturn(dailyPath);
        when(root.<Integer>get("activeDays")).thenReturn(activeDaysPath);

        when(cb.coalesce(dailyPath, 0)).thenReturn(coalesceDaily);
        when(cb.coalesce(activeDaysPath, 0)).thenReturn(coalesceActive);

        when(cb.prod(coalesceDaily, coalesceActive)).thenReturn(weeklyExpression);
        when(cb.greaterThanOrEqualTo(weeklyExpression, min)).thenReturn(predicate);

        Specification<Media> spec =
                MediaSpecifications.weeklyImpressionsGreaterThan(min);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(predicate, result);
    }



    @Test
    void whenMinWeeklyImpressionsIsNull_thenReturnNull() {
        Specification<Media> spec = MediaSpecifications.weeklyImpressionsGreaterThan(null);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNull(result);
        verifyNoInteractions(root, cb);
    }

    @Mock
    private Join<Media, MediaLocation> location;

    @Test
    void whenBoundsProvided_thenReturnLatLngPredicate() {
        List<Double> bounds = Arrays.asList(10.0, 20.0, 30.0, 40.0);

        when(root.<Media, MediaLocation>join("mediaLocation", JoinType.INNER))
                .thenReturn(location);
        when(location.get("latitude")).thenReturn(path);
        when(location.get("longitude")).thenReturn(path);
        when(cb.between(any(), anyDouble(), anyDouble())).thenReturn(predicate);
        when(cb.and(predicate, predicate)).thenReturn(predicate);

        Specification<Media> spec = MediaSpecifications.withinBounds(bounds);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
    }

    @Test
    void whenBoundsInvalid_thenReturnNull() {
        Specification<Media> spec = MediaSpecifications.withinBounds(Arrays.asList(1.0, 2.0));

        Predicate result = spec.toPredicate(root, query, cb);

        assertNull(result);
        verifyNoInteractions(root, cb);
    }

    @Test
    void whenBoundsNull_thenReturnNull() {
        Specification<Media> spec = MediaSpecifications.withinBounds(null);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNull(result);
        verifyNoInteractions(root, cb);
    }

    @Test
    void whenExcludedIdIsProvided_thenReturnNotEqualPredicate() {
        UUID excludedId = UUID.randomUUID();

        when(root.get("id")).thenReturn(path);
        when(cb.notEqual(path, excludedId)).thenReturn(predicate);

        Specification<Media> spec = MediaSpecifications.mediaIdIsNotEqual(excludedId);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        assertEquals(predicate, result);
    }

    @Test
    void whenExcludedIdIsNull_thenReturnNull() {
        Specification<Media> spec = MediaSpecifications.mediaIdIsNotEqual(null);

        Predicate result = spec.toPredicate(root, query, cb);

        assertNull(result);
        verifyNoInteractions(root, cb);
    }

}
