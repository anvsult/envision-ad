package com.envisionad.webservice.appsettings.businesslogiclayer;

import com.envisionad.webservice.appsettings.dataaccesslayer.AppSetting;
import com.envisionad.webservice.appsettings.dataaccesslayer.AppSettingRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AppSettingServiceImpl implements AppSettingService {

    private final AppSettingRepository repository;

    public AppSettingServiceImpl(AppSettingRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<AppSetting> findByKey(String key) {
        return repository.findById(key);
    }

    @Override
    public AppSetting upsert(String key, String value) {
        AppSetting setting = repository.findById(key).orElse(new AppSetting());
        setting.setKey(key);
        setting.setValue(value);
        return repository.save(setting);
    }
}
