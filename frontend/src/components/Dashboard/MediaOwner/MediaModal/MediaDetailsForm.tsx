"use client";

import React from "react";
import { TextInput, Select } from "@mantine/core";
import { useTranslations } from "next-intl";
import type { MediaFormState } from "../hooks/useMediaForm";

interface MediaDetailsFormProps {
  formState: MediaFormState;
  onFieldChange: <K extends keyof MediaFormState>(
    field: K,
    value: MediaFormState[K]
  ) => void;
}

export function MediaDetailsForm({
  formState,
  onFieldChange,
}: MediaDetailsFormProps) {
  const t = useTranslations("mediaModal");
  const tPage = useTranslations("mediaPage");
  const handleRestrictedChange = (
    field: keyof MediaFormState,
    value: string,
    pattern: RegExp
  ) => {
    const cleaned = value.replace(pattern, "");
    onFieldChange(field, cleaned);
  };

  const renderLabel = (
    label: string,
    value: string | number | null | undefined,
    maxLength: number,
    required: boolean = false,
    customError?: string | null
  ) => {
    const currentLength = value ? String(value).length : 0;
    const isLimitReached = currentLength >= maxLength;
    const errorMessage = customError || (isLimitReached ? t("form.limitReached", { limit: maxLength }) : null);

    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <span>{label}</span>
        {required && <span style={{ color: "#fa5252" }}> *</span>}
        {errorMessage && (
          <span style={{ color: "red", fontSize: "12px" }}>
            {errorMessage}
          </span>
        )}
      </span>
    );
  };

  return (
    <>
      <h3>{tPage("detailsTitle")}</h3>
      <TextInput
        label={renderLabel(t("form.nameLabel"), formState.mediaTitle, 52, true)}
        placeholder={t("form.namePlaceholder")}
        value={formState.mediaTitle}
        onChange={(e) => onFieldChange("mediaTitle", e.currentTarget.value)}
        required
        withAsterisk={false}
        maxLength={52}
      />

      <div style={{ height: 12 }} />
      <TextInput
        label={renderLabel(t("form.addressLabel"), formState.mediaAddress, 52, true)}
        placeholder={t("form.addressPlaceholder")}
        value={formState.mediaAddress}
        onChange={(e) => onFieldChange("mediaAddress", e.currentTarget.value)}
        required
        withAsterisk={false}
        maxLength={52}
      />

      <div style={{ height: 12 }} />
      <Select
        label={tPage("details.type")}
        allowDeselect={false}
        data={[
          { value: "DIGITAL", label: tPage("mediaTypes.DIGITAL") },
          { value: "POSTER", label: tPage("mediaTypes.POSTER") },
        ]}
        placeholder={t("form.typePlaceholder")}
        value={formState.displayType ?? undefined}
        onChange={(v) => {
          const val = typeof v === "string" ? v : (v as string | null);
          onFieldChange("displayType", val);
          if (val === "POSTER") {
            onFieldChange("resolution", "");
            onFieldChange("aspectRatio", "");
          }
          if (val === "DIGITAL") {
            onFieldChange("widthCm", "");
            onFieldChange("heightCm", "");
          }
        }}
      />
      <div style={{ height: 12 }} />
      {formState.displayType?.toLowerCase() === "digital" && (
        <TextInput
          label={renderLabel(t("form.loopDurationLabel"), formState.loopDuration, 10)}
          placeholder={t("form.loopDurationPlaceholder")}
          value={formState.loopDuration}
          onChange={(e) =>
            handleRestrictedChange("loopDuration", e.currentTarget.value, /[^0-9]/g)
          }
          maxLength={10}
        />
      )}
      {formState.displayType?.toLowerCase() === "digital" && (
        <>
          <div style={{ height: 12 }} />
          <TextInput
            label={renderLabel(t("form.resolutionLabel"), formState.resolution, 10, true)}
            placeholder={t("form.resolutionPlaceholder")}
            value={formState.resolution}
            onChange={(e) =>
              handleRestrictedChange("resolution", e.currentTarget.value, /[^0-9xX]/g)
            }
            required
            withAsterisk={false}
            maxLength={10}
          />

          <div style={{ height: 12 }} />
          <TextInput
            label={tPage("details.aspectRatio")}
            placeholder={t("form.aspectRatioPlaceholder")}
            value={formState.aspectRatio}
            onChange={(e) =>
              handleRestrictedChange("aspectRatio", e.currentTarget.value, /[^0-9:]/g)
            }
          />
        </>
      )}

      {formState.displayType?.toLowerCase() === "poster" && (
        <>
          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <TextInput
              label={renderLabel(t("form.widthLabel"), formState.widthCm, 12)}
              placeholder={t("form.widthPlaceholder")}
              type="text"
              style={{ flex: 1 }}
              value={formState.widthCm}
              onChange={(e) =>
                handleRestrictedChange("widthCm", e.currentTarget.value, /[^0-9]/g)
              }
              maxLength={12}
            />
            <TextInput
              label={renderLabel(t("form.heightLabel"), formState.heightCm, 12)}
              placeholder={t("form.heightPlaceholder")}
              type="text"
              style={{ flex: 1 }}
              value={formState.heightCm}
              onChange={(e) =>
                handleRestrictedChange("heightCm", e.currentTarget.value, /[^0-9]/g)
              }
              maxLength={12}
            />
          </div>
        </>
      )}

      <div style={{ height: 12 }} />
      <TextInput
        label={renderLabel(
          t("form.priceLabel"),
          formState.weeklyPrice,
          8,
          false,
          /^\d+\.\d{2,}$/.test(String(formState.weeklyPrice || "")) ? t("form.decimalLimit") : null
        )}
        placeholder={t("form.pricePlaceholder")}
        type="text"
        value={formState.weeklyPrice}
        onChange={(e) =>
          /^\d*\.?\d{0,2}$/.test(e.currentTarget.value) &&
          onFieldChange("weeklyPrice", e.currentTarget.value)
        }
        maxLength={8}
      />

      <div style={{ height: 12 }} />
      <TextInput
        label={renderLabel(t("form.impressionsLabel"), formState.dailyImpressions, 9)}
        placeholder={t("form.impressionsPlaceholder")}
        type="text"
        value={formState.dailyImpressions}
        onChange={(e) =>
          handleRestrictedChange("dailyImpressions", e.currentTarget.value, /[^0-9]/g)
        }
        maxLength={9}
      />
    </>
  );
}
