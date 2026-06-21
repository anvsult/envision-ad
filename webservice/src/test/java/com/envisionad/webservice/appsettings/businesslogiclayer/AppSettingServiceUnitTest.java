package com.envisionad.webservice.appsettings.businesslogiclayer;

import com.envisionad.webservice.appsettings.dataaccesslayer.AppSetting;
import com.envisionad.webservice.appsettings.dataaccesslayer.AppSettingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppSettingServiceUnitTest {

    @InjectMocks
    private AppSettingServiceImpl service;

    @Mock
    private AppSettingRepository repository;

    @Test
    void findByKey_existingKey_returnsSetting() {
        AppSetting setting = new AppSetting();
        setting.setKey("book-meeting-url");
        setting.setValue("https://calendly.com/test");
        when(repository.findById("book-meeting-url")).thenReturn(Optional.of(setting));

        Optional<AppSetting> result = service.findByKey("book-meeting-url");

        assertTrue(result.isPresent());
        assertEquals("https://calendly.com/test", result.get().getValue());
    }

    @Test
    void findByKey_missingKey_returnsEmpty() {
        when(repository.findById("missing-key")).thenReturn(Optional.empty());

        Optional<AppSetting> result = service.findByKey("missing-key");

        assertTrue(result.isEmpty());
    }

    @Test
    void upsert_newKey_createsAndReturnsSetting() {
        AppSetting saved = new AppSetting();
        saved.setKey("book-meeting-url");
        saved.setValue("https://calendly.com/test");
        when(repository.findById("book-meeting-url")).thenReturn(Optional.empty());
        when(repository.save(any(AppSetting.class))).thenReturn(saved);

        AppSetting result = service.upsert("book-meeting-url", "https://calendly.com/test");

        assertEquals("book-meeting-url", result.getKey());
        assertEquals("https://calendly.com/test", result.getValue());
        verify(repository).save(any(AppSetting.class));
    }

    @Test
    void upsert_existingKey_updatesValue() {
        AppSetting existing = new AppSetting();
        existing.setKey("book-meeting-url");
        existing.setValue("https://calendly.com/old");
        when(repository.findById("book-meeting-url")).thenReturn(Optional.of(existing));
        when(repository.save(any(AppSetting.class))).thenAnswer(inv -> inv.getArgument(0));

        AppSetting result = service.upsert("book-meeting-url", "https://calendly.com/new");

        assertEquals("https://calendly.com/new", result.getValue());
        verify(repository).save(existing);
    }
}
