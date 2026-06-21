package com.envisionad.webservice.appsettings.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingRepository extends JpaRepository<AppSetting, String> {
}
