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

  return (
    <>
      <h3>{tPage("detailsTitle")}</h3>
      <TextInput
        label={t("form.nameLabel")}
        placeholder={t("form.namePlaceholder")}
        value={formState.mediaTitle}
        onChange={(e) => onFieldChange("mediaTitle", e.currentTarget.value)}
        required
        maxLength={52}
      />
      <div style={{ height: 12 }} />
      <TextInput
        label={t("ownerLabel")}
        placeholder={t("form.ownerPlaceholder")}
        value={formState.mediaOwnerName}
        disabled
      />
      <div style={{ height: 12 }} />
      <TextInput
        label={t("form.addressLabel")}
        placeholder={t("form.addressPlaceholder")}
        value={formState.mediaAddress}
        onChange={(e) => onFieldChange("mediaAddress", e.currentTarget.value)}
        required
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
          label={t("form.loopDurationLabel")}
          placeholder={t("form.loopDurationPlaceholder")}
          value={formState.loopDuration}
          onChange={(e) =>
            handleRestrictedChange("loopDuration", e.currentTarget.value, /[^0-9]/g)
          }
          maxLength={12}
        />
      )}
      {formState.displayType?.toLowerCase() === "digital" && (
        <>
          <div style={{ height: 12 }} />
          <TextInput
            label={t("form.resolutionLabel")}
            placeholder={t("form.resolutionPlaceholder")}
            value={formState.resolution}
            onChange={(e) =>
              handleRestrictedChange("resolution", e.currentTarget.value, /[^0-9xX]/g)
            }
            required
            maxLength={12}
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
              label={t("form.widthLabel")}
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
              label={t("form.heightLabel")}
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
        label={t("form.priceLabel")}
        placeholder={t("form.pricePlaceholder")}
        type="text"
        value={formState.weeklyPrice}
        onChange={(e) =>
          handleRestrictedChange("weeklyPrice", e.currentTarget.value, /[^0-9]/g)
        }
        maxLength={12}
      />

      <div style={{ height: 12 }} />
      <TextInput
        label={t("form.impressionsLabel")}
        placeholder={t("form.impressionsPlaceholder")}
        type="number"
        value={formState.dailyImpressions}
        onChange={(e) => onFieldChange("dailyImpressions", e.currentTarget.value)}
        maxLength={12}
      />
    </>
  );
}
