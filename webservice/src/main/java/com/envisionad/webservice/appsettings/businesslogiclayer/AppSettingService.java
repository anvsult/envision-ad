package com.envisionad.webservice.appsettings.businesslogiclayer;

import com.envisionad.webservice.appsettings.dataaccesslayer.AppSetting;

import java.util.Optional;

public interface AppSettingService {
    Optional<AppSetting> findByKey(String key);
    AppSetting upsert(String key, String value);
}
