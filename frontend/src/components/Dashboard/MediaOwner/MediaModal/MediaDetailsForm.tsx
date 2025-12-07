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

      <div style={{ height: 12 }} />
      <TextInput
        label="Address"
        placeholder="Placeholder text"
        value={formState.mediaAddress}
        onChange={(e) => onFieldChange("mediaAddress", e.currentTarget.value)}
        required
      />

      <div style={{ height: 12 }} />
      <Select
        label="Type of display"
        data={[
          { value: "DIGITAL", label: "Digital" },
          { value: "POSTER", label: "Poster" },
        ]}
        placeholder="Select type"
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
          label="Loop duration (sec)"
          placeholder="e.g. 30"
          value={formState.loopDuration}
          onChange={(e) => onFieldChange("loopDuration", e.currentTarget.value)}
        />
      )}
      {formState.displayType?.toLowerCase() === "digital" && (
        <>
          <div style={{ height: 12 }} />
          <TextInput
            label="Resolution (px)"
            placeholder="Ex. 1920x1080"
            value={formState.resolution}
            onChange={(e) => onFieldChange("resolution", e.currentTarget.value)}
            required
          />

          <div style={{ height: 12 }} />
          <TextInput
            label="Aspect ratio"
            placeholder="e.g. 16:9"
            value={formState.aspectRatio}
            onChange={(e) =>
              onFieldChange("aspectRatio", e.currentTarget.value)
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
              type="number"
              style={{ flex: 1 }}
              value={formState.widthCm}
              onChange={(e) => onFieldChange("widthCm", e.currentTarget.value)}
            />
            <TextInput
              label="Height (cm)"
              placeholder="Ex. 200"
              type="number"
              style={{ flex: 1 }}
              value={formState.heightCm}
              onChange={(e) => onFieldChange("heightCm", e.currentTarget.value)}
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
        onChange={(e) => onFieldChange("weeklyPrice", e.currentTarget.value)}
      />
    </>
  );
}
