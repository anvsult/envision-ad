"use client";

import React from "react";
import { Checkbox, TextInput } from "@mantine/core";
import type { MediaFormState } from "../hooks/useMediaForm";

interface ScheduleSelectorProps {
  formState: MediaFormState;
  onFieldChange: <K extends keyof MediaFormState>(
    field: K,
    value: MediaFormState[K]
  ) => void;
  onDayTimeChange: (day: string, part: "start" | "end", value: string) => void;
}

export function ScheduleSelector({
  formState,
  onFieldChange,
  onDayTimeChange,
}: ScheduleSelectorProps) {
  return (
    <>
      <div style={{ height: 18 }} />
      <h3>Months</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.keys(formState.activeMonths).map((m) => (
          <Checkbox
            key={m}
            label={m}
            checked={!!formState.activeMonths[m]}
            onChange={(e) =>
              onFieldChange("activeMonths", {
                ...formState.activeMonths,
                [m]: (e.target as HTMLInputElement).checked,
              })
            }
          />
        ))}
      </div>

      <div style={{ height: 18 }} />
      <h3>Days & Times</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 1fr",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div />
        <strong>Start</strong>
        <strong>End</strong>
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((d) => (
          <React.Fragment key={d}>
            <Checkbox
              label={d}
              checked={!!formState.activeDaysOfWeek[d]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange("activeDaysOfWeek", {
                  ...formState.activeDaysOfWeek,
                  [d]: (e.target as HTMLInputElement).checked,
                })
              }
            />
            <TextInput
              placeholder={formState.activeDaysOfWeek[d] ? "00:00" : "Closed"}
              disabled={!formState.activeDaysOfWeek[d]}
              type="time"
              value={formState.dailyOperatingHours[d]?.start ?? ""}
              onChange={(e) =>
                onDayTimeChange(d, "start", e.currentTarget.value)
              }
            />
            <TextInput
              placeholder={formState.activeDaysOfWeek[d] ? "00:00" : "Closed"}
              disabled={!formState.activeDaysOfWeek[d]}
              type="time"
              value={formState.dailyOperatingHours[d]?.end ?? ""}
              onChange={(e) => onDayTimeChange(d, "end", e.currentTarget.value)}
            />
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
