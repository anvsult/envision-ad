"use client";

import React from "react";
import { Select, TextInput, Tooltip } from "@mantine/core";
import type { MediaFormState } from "../hooks/useMediaForm";

interface MediaDetailsFormProps {
  formState: MediaFormState;
  onFieldChange: <K extends keyof MediaFormState>(
    field: K,
    value: MediaFormState[K]
  ) => void;
}

import { useTranslations } from "next-intl";

// ... (imports)

export function MediaDetailsForm({
  formState,
  onFieldChange,
}: MediaDetailsFormProps) {
  const t = useTranslations("mediaModal");
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const isBackspacing = React.useRef(false);

  const handleRestrictedChange = (
    field: keyof MediaFormState,
    value: string,
    pattern: RegExp
  ) => {
    const cleaned = value.replace(pattern, "");
    onFieldChange(field, cleaned);
  };

  const isMaxLength = (value: string, max: number) => value.length >= max;

  const hasTwoDecimals = (value: string) => /^\d*\.\d{2}$/.test(value);

  const handleFocus = (field: string) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  return (
    <>
      <h3>{t("sections.details")}</h3>
      <Tooltip
        label={t("tooltips.max52")}
        opened={focusedField === "mediaTitle" && isMaxLength(formState.mediaTitle, 52)}
        withArrow
        position="right"
        color="orange"
      >
        <TextInput
          label={t("labels.mediaName")}
          placeholder={t("placeholders.mediaName")}
          value={formState.mediaTitle}
          onChange={(e) => onFieldChange("mediaTitle", e.currentTarget.value)}
          onFocus={() => handleFocus("mediaTitle")}
          onBlur={handleBlur}
          maxLength={52}
          required
          error={formState.errors["mediaTitle"]}
        />
      </Tooltip>
      <div style={{ height: 12 }} />

      <div style={{ height: 12 }} />
      <Select
        label={t("labels.typeOfDisplay")}
        data={[
          { value: "DIGITAL", label: "Digital" },
          { value: "POSTER", label: "Poster" },
        ]}
        placeholder={t("placeholders.selectType")}
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
        error={formState.errors["displayType"]}
      />
      <div style={{ height: 12 }} />
      {formState.displayType?.toLowerCase() === "digital" && (
        <Tooltip
          label={t("tooltips.max5")}
          opened={focusedField === "loopDuration" && isMaxLength(formState.loopDuration, 5)}
          withArrow
          position="right"
          color="orange"
        >
          <TextInput
            label={t("labels.loopDuration")}
            placeholder={t("placeholders.loopDuration")}
            value={formState.loopDuration}
            onChange={(e) =>
              handleRestrictedChange("loopDuration", e.currentTarget.value, /[^0-9]/g)
            }
            onFocus={() => handleFocus("loopDuration")}
            onBlur={handleBlur}
            error={formState.errors["loopDuration"]}
            maxLength={5}
          />
        </Tooltip>
      )}
      {formState.displayType?.toLowerCase() === "digital" && (
        <>
          <div style={{ height: 12 }} />
          <Tooltip
            label={t("tooltips.max20")}
            opened={focusedField === "resolution" && isMaxLength(formState.resolution, 20)}
            withArrow
            position="right"
            color="orange"
          >
            <TextInput
              label={t("labels.resolution")}
              placeholder={t("placeholders.resolution")}
              value={formState.resolution}
              onChange={(e) =>
                handleRestrictedChange("resolution", e.currentTarget.value, /[^0-9xX]/g)
              }
              onFocus={() => handleFocus("resolution")}
              onBlur={handleBlur}
              maxLength={20}
              required
              error={formState.errors["resolution"]}
            />
          </Tooltip>

          <div style={{ height: 12 }} />
          <Tooltip
            label={t("tooltips.max10")}
            opened={focusedField === "aspectRatio" && isMaxLength(formState.aspectRatio, 10)}
            withArrow
            position="right"
            color="orange"
          >
            <TextInput
              label={t("labels.aspectRatio")}
              placeholder={t("placeholders.aspectRatio")}
              value={formState.aspectRatio}
              onChange={(e) =>
                handleRestrictedChange("aspectRatio", e.currentTarget.value, /[^0-9:]/g)
              }
              onFocus={() => handleFocus("aspectRatio")}
              onBlur={handleBlur}
              maxLength={10}
              error={formState.errors["aspectRatio"]}
            />
          </Tooltip>
        </>
      )}

      {formState.displayType?.toLowerCase() === "poster" && (
        <>
          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <TextInput
              label={t("labels.width")}
              placeholder={t("placeholders.width")}
              type="text"
              style={{ flex: 1 }}
              value={formState.widthCm}
              onChange={(e) =>
                handleRestrictedChange("widthCm", e.currentTarget.value, /[^0-9]/g)
              }
              error={formState.errors["widthCm"]}
            />
            <TextInput
              label={t("labels.height")}
              placeholder={t("placeholders.height")}
              type="text"
              style={{ flex: 1 }}
              value={formState.heightCm}
              onChange={(e) =>
                handleRestrictedChange("heightCm", e.currentTarget.value, /[^0-9]/g)
              }
              error={formState.errors["heightCm"]}
            />
          </div>
        </>
      )}

      <div style={{ height: 12 }} />
      <Tooltip
        label={isMaxLength(formState.weeklyPrice, 8) ? t("tooltips.max8") : t("tooltips.maxDecimals")}
        opened={
          focusedField === "weeklyPrice" &&
          (isMaxLength(formState.weeklyPrice, 8) || hasTwoDecimals(formState.weeklyPrice))
        }
        withArrow
        position="right"
        color="orange"
      >
        <TextInput
          label={t("labels.price")}
          placeholder={t("placeholders.price")}
          type="text"
          value={formState.weeklyPrice}
          onKeyDown={(e) => {
            isBackspacing.current = e.key === "Backspace" || e.key === "Delete";
          }}
          onChange={(e) => {
            let val = e.currentTarget.value;
            // Allow max 5 digits before dot, and max 2 decimals
            if (!/^\d{0,5}(\.\d{0,2})?$/.test(val)) return;

            if (!isBackspacing.current && /^\d{5}$/.test(val)) {
              val += ".";
            }
            onFieldChange("weeklyPrice", val);
          }}
          onFocus={() => handleFocus("weeklyPrice")}
          maxLength={8}
          onBlur={() => {
            handleBlur();
            if (formState.weeklyPrice) {
              const num = parseFloat(formState.weeklyPrice);
              if (!isNaN(num)) {
                onFieldChange("weeklyPrice", num.toFixed(2));
              }
            }
          }}
          error={formState.errors["weeklyPrice"]}
        />
      </Tooltip>

      <div style={{ height: 12 }} />
      <TextInput
        label={t("labels.dailyImpressions")}
        placeholder={t("placeholders.dailyImpressions")}
        type="text"
        maxLength={9}
        value={formState.dailyImpressions}
        onChange={(e) =>
          handleRestrictedChange("dailyImpressions", e.currentTarget.value, /[^0-9]/g)
        }
        error={formState.errors["dailyImpressions"]}
      />
    </>
  );
}
