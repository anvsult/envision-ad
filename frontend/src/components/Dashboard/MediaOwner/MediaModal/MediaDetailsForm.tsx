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
          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Tooltip
              label={t("tooltips.max4")}
              opened={focusedField === "resWidth" && isMaxLength(formState.resolution.split("x")[0] || "", 4)}
              withArrow
              position="right"
              color="orange"
            >
              <TextInput
                label={t("labels.resolutionWidth")}
                placeholder={t("placeholders.resolutionWidth")}
                value={formState.resolution ? formState.resolution.toLowerCase().split("x")[0] : ""}
                onChange={(e) => {
                  const val = e.currentTarget.value.replace(/[^0-9]/g, "");
                  const currentHeight = formState.resolution ? formState.resolution.toLowerCase().split("x")[1] : "";
                  const newRes = `${val}x${currentHeight || ""}`;
                  onFieldChange("resolution", newRes === "x" ? "" : newRes);
                }}
                onFocus={() => handleFocus("resWidth")}
                onBlur={handleBlur}
                maxLength={4}
                required
                style={{ flex: 1 }}
                error={formState.errors["resolution"]}
              />
            </Tooltip>
            <Tooltip
              label={t("tooltips.max4")}
              opened={focusedField === "resHeight" && isMaxLength(formState.resolution.split("x")[1] || "", 4)}
              withArrow
              position="right"
              color="orange"
            >
              <TextInput
                label={t("labels.resolutionHeight")}
                placeholder={t("placeholders.resolutionHeight")}
                value={formState.resolution ? formState.resolution.toLowerCase().split("x")[1] : ""}
                onChange={(e) => {
                  const val = e.currentTarget.value.replace(/[^0-9]/g, "");
                  const currentWidth = formState.resolution ? formState.resolution.toLowerCase().split("x")[0] : "";
                  const newRes = `${currentWidth || ""}x${val}`;
                  onFieldChange("resolution", newRes === "x" ? "" : newRes);
                }}
                onFocus={() => handleFocus("resHeight")}
                onBlur={handleBlur}
                maxLength={4}
                required
                style={{ flex: 1 }}
                error={formState.errors["resolution"]}
              />
            </Tooltip>
          </div>

          <div style={{ height: 12 }} />
          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Tooltip
              label={t("tooltips.max2")}
              opened={focusedField === "arWidth" && isMaxLength(formState.aspectRatio.split(":")[0] || "", 2)}
              withArrow
              position="right"
              color="orange"
            >
              <TextInput
                label={t("labels.aspectRatioWidth")}
                placeholder={t("placeholders.aspectRatioWidth")}
                value={formState.aspectRatio ? formState.aspectRatio.split(":")[0] : ""}
                onChange={(e) => {
                  const val = e.currentTarget.value.replace(/[^0-9]/g, "");
                  const currentHeight = formState.aspectRatio ? formState.aspectRatio.split(":")[1] : "";
                  const newAr = `${val}:${currentHeight || ""}`;
                  onFieldChange("aspectRatio", newAr === ":" ? "" : newAr);
                }}
                onFocus={() => handleFocus("arWidth")}
                onBlur={handleBlur}
                maxLength={2}
                required
                style={{ flex: 1 }}
                error={formState.errors["aspectRatio"]}
              />
            </Tooltip>
            <Tooltip
              label={t("tooltips.max2")}
              opened={focusedField === "arHeight" && isMaxLength(formState.aspectRatio.split(":")[1] || "", 2)}
              withArrow
              position="right"
              color="orange"
            >
              <TextInput
                label={t("labels.aspectRatioHeight")}
                placeholder={t("placeholders.aspectRatioHeight")}
                value={formState.aspectRatio ? formState.aspectRatio.split(":")[1] : ""}
                onChange={(e) => {
                  const val = e.currentTarget.value.replace(/[^0-9]/g, "");
                  const currentWidth = formState.aspectRatio ? formState.aspectRatio.split(":")[0] : "";
                  const newAr = `${currentWidth || ""}:${val}`;
                  onFieldChange("aspectRatio", newAr === ":" ? "" : newAr);
                }}
                onFocus={() => handleFocus("arHeight")}
                onBlur={handleBlur}
                maxLength={2}
                required
                style={{ flex: 1 }}
                error={formState.errors["aspectRatio"]}
              />
            </Tooltip>
          </div>
        </>
      )}

      {formState.displayType?.toLowerCase() === "poster" && (
        <>
          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Tooltip
              label={t("tooltips.max5")}
              opened={focusedField === "widthCm" && isMaxLength(formState.widthCm, 5)}
              withArrow
              position="right"
              color="orange"
            >
              <TextInput
                label={t("labels.width")}
                placeholder={t("placeholders.width")}
                type="text"
                style={{ flex: 1 }}
                value={formState.widthCm}
                onChange={(e) =>
                  handleRestrictedChange("widthCm", e.currentTarget.value, /[^0-9]/g)
                }
                onFocus={() => handleFocus("widthCm")}
                onBlur={handleBlur}
                maxLength={5}
                error={formState.errors["widthCm"]}
              />
            </Tooltip>
            <Tooltip
              label={t("tooltips.max5")}
              opened={focusedField === "heightCm" && isMaxLength(formState.heightCm, 5)}
              withArrow
              position="right"
              color="orange"
            >
              <TextInput
                label={t("labels.height")}
                placeholder={t("placeholders.height")}
                type="text"
                style={{ flex: 1 }}
                value={formState.heightCm}
                onChange={(e) =>
                  handleRestrictedChange("heightCm", e.currentTarget.value, /[^0-9]/g)
                }
                onFocus={() => handleFocus("heightCm")}
                onBlur={handleBlur}
                maxLength={5}
                error={formState.errors["heightCm"]}
              />
            </Tooltip>
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
