"use client";

import React from "react";
import { TextInput, Select } from "@mantine/core";
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
      <h3>Details</h3>
      <TextInput
        label="Media Name"
        placeholder="Media name"
        value={formState.mediaTitle}
        onChange={(e) => onFieldChange("mediaTitle", e.currentTarget.value)}
        required
      />
      <div style={{ height: 12 }} />
      <TextInput
        label="Media Owner"
        placeholder="Owner name"
        value={formState.mediaOwnerName}
        onChange={(e) => onFieldChange("mediaOwnerName", e.currentTarget.value)}
      />
      <div style={{ height: 12 }} />

      {/* TODO: UPDATE TO ADD MEDIA LOCATION */}
      {/* <div style={{ height: 12 }} />
      <TextInput
        label="Address"
        placeholder="Placeholder text"
        value={formState.mediaAddress}
        onChange={(e) => onFieldChange("mediaAddress", e.currentTarget.value)}
        required
      /> */}

      <div style={{ height: 12 }} />
      <Select
        label="Type of display"
        data={[
          { value: "DIGITAL", label: "Digital" },
          { value: "POSTER", label: "Poster" },
        ]}
        placeholder="Select type"
        value={formState.displayType }
        onChange={(v) => {
          const val = typeof v === "string" ? v : (v as unknown as string);
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
          label="Loop duration (sec)"
          placeholder="e.g. 30"
          value={formState.loopDuration}
          onChange={(e) =>
            handleRestrictedChange("loopDuration", e.currentTarget.value, /[^0-9]/g)
          }
        />
      )}
      {formState.displayType?.toLowerCase() === "digital" && (
        <>
          <div style={{ height: 12 }} />
          <TextInput
            label="Resolution (px)"
            placeholder="Ex. 1920x1080"
            value={formState.resolution}
            onChange={(e) =>
              handleRestrictedChange("resolution", e.currentTarget.value, /[^0-9xX]/g)
            }
            required
          />

          <div style={{ height: 12 }} />
          <TextInput
            label="Aspect ratio"
            placeholder="e.g. 16:9"
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
              label="Width (cm)"
              placeholder="Ex. 80"
              type="text"
              style={{ flex: 1 }}
              value={formState.widthCm}
              onChange={(e) =>
                handleRestrictedChange("widthCm", e.currentTarget.value, /[^0-9]/g)
              }
            />
            <TextInput
              label="Height (cm)"
              placeholder="Ex. 200"
              type="text"
              style={{ flex: 1 }}
              value={formState.heightCm}
              onChange={(e) =>
                handleRestrictedChange("heightCm", e.currentTarget.value, /[^0-9]/g)
              }
            />
          </div>
        </>
      )}

      <div style={{ height: 12 }} />
      <TextInput
        label="Price (per week)"
        placeholder="$50"
        type="text"
        value={formState.weeklyPrice}
        onChange={(e) =>
          handleRestrictedChange("weeklyPrice", e.currentTarget.value, /[^0-9]/g)
        }
      />

      <div style={{ height: 12 }} />
      <TextInput
        label="Daily impressions"
        placeholder="Daily impressions"
        type="number"
        value={formState.dailyImpressions}
        onChange={(e) => onFieldChange("dailyImpressions", e.currentTarget.value)}
      />
    </>
  );
}
