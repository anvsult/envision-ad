package com.envisionad.webservice.media.DataAccessLayer;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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
    private Predicate predicate;

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
}
