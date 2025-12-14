package com.envisionad.webservice.advertisement.datamapperlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.AdDuration;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AdDurationConverter implements AttributeConverter<AdDuration, Integer> {
    @Override
    public Integer convertToDatabaseColumn(AdDuration attribute) {
        return attribute == null ? null : attribute.getSeconds();
    }

    @Override
    public AdDuration convertToEntityAttribute(Integer dbData) {
        return AdDuration.fromSeconds(dbData);
    }
}
