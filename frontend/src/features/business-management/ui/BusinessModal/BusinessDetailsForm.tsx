"use client";

import React from "react";
import { TextInput, Select } from "@mantine/core";
import { useTranslations } from "next-intl";
import { BusinessRequest, CompanySize } from "@/entities/businesses";

interface BusinessDetailsFormProps {
  formState: BusinessRequest;
  onFieldChange: <K extends keyof BusinessRequest>(
    field: K,
    value: BusinessRequest[K]
  ) => void;
}

export function BusinessDetailsForm({
  formState,
  onFieldChange,
}: BusinessDetailsFormProps) {
  const t = useTranslations("business");

  const companySizeOptions = Object.values(CompanySize).map((size) => ({
    value: size,
    label: t(`sizes.${size}`),
  }));

  return (
    <>
      <h3>{t("form.title")}</h3>
      <TextInput
        label={t("form.nameLabel")}
        placeholder={t("form.namePlaceholder")}
        value={formState.name}
        onChange={(e) => onFieldChange("name", e.currentTarget.value)}
        required
      />
      <div style={{ height: 12 }} />

      <Select
        label={t("form.sizeLabel")}
        placeholder={t("form.sizePlaceholder")}
        data={companySizeOptions}
        value={formState.companySize}
        onChange={(val) => {
          if (val) onFieldChange("companySize", val as CompanySize);
        }}
        required
      />

      <div style={{ height: 12 }} />
      <h4>{t("form.addressLabel")}</h4>
      <TextInput
        label={t("form.streetLabel")}
        placeholder={t("form.streetPlaceholder")}
        value={formState.street}
        onChange={(e) => onFieldChange("street", e.currentTarget.value)}
        required
      />
      <div style={{ height: 12 }} />

      <div style={{ display: "flex", gap: 12 }}>
        <TextInput
          label={t("form.cityLabel")}
          placeholder={t("form.cityPlaceholder")}
          value={formState.city}
          onChange={(e) => onFieldChange("city", e.currentTarget.value)}
          required
          style={{ flex: 1 }}
        />
        <TextInput
          label={t("form.stateLabel")}
          placeholder={t("form.statePlaceholder")}
          value={formState.state}
          onChange={(e) => onFieldChange("state", e.currentTarget.value)}
          required
          style={{ flex: 1 }}
        />
      </div>
      <div style={{ height: 12 }} />

      <div style={{ display: "flex", gap: 12 }}>
        <TextInput
          label={t("form.zipLabel")}
          placeholder={t("form.zipPlaceholder")}
          value={formState.zipCode}
          onChange={(e) => onFieldChange("zipCode", e.currentTarget.value)}
          required
          style={{ flex: 1 }}
        />
        <TextInput
          label={t("form.countryLabel")}
          placeholder={t("form.countryPlaceholder")}
          value={formState.country}
          onChange={(e) => onFieldChange("country", e.currentTarget.value)}
          required
          style={{ flex: 1 }}
        />
      </div>
    </>
  );
}
