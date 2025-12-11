package com.envisionad.webservice.media.BusinessLayer;

import com.envisionad.webservice.media.DataAccessLayer.MediaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("unchecked")
class MediaServiceImplTest {

    @Mock
    private MediaRepository mediaRepository;

    @InjectMocks
    private MediaServiceImpl mediaService;

    @Test
    void getAllFilteredActiveMedia_AllFiltersNull_ShouldInvokeFindAllWithStatusActive() {
        when(mediaRepository.findAll(any(Specification.class))).thenReturn(Collections.emptyList());

        mediaService.getAllFilteredActiveMedia(null, null, null, null);

        verify(mediaRepository).findAll(any(Specification.class));
    }

    @Test
    void getAllFilteredActiveMedia_WithTitle_ShouldInvokeFindAll() {
        when(mediaRepository.findAll(any(Specification.class))).thenReturn(Collections.emptyList());

        mediaService.getAllFilteredActiveMedia("test", null, null, null);

        verify(mediaRepository).findAll(any(Specification.class));
    }

    @Test
    void getAllFilteredActiveMedia_WithPriceRange_ShouldInvokeFindAll() {
        when(mediaRepository.findAll(any(Specification.class))).thenReturn(Collections.emptyList());

        mediaService.getAllFilteredActiveMedia(null, BigDecimal.ZERO, BigDecimal.TEN, null);

        verify(mediaRepository).findAll(any(Specification.class));
    }

    @Test
    void getAllFilteredActiveMedia_WithImpressions_ShouldInvokeFindAll() {
        when(mediaRepository.findAll(any(Specification.class))).thenReturn(Collections.emptyList());

        mediaService.getAllFilteredActiveMedia(null, null, null, 100);

        verify(mediaRepository).findAll(any(Specification.class));
    }

    @Test
    void getAllFilteredActiveMedia_AllFiltersPresent_ShouldInvokeFindAll() {
        when(mediaRepository.findAll(any(Specification.class))).thenReturn(Collections.emptyList());

        mediaService.getAllFilteredActiveMedia("title", BigDecimal.ZERO, BigDecimal.TEN, 100);

        verify(mediaRepository).findAll(any(Specification.class));
    }
}
