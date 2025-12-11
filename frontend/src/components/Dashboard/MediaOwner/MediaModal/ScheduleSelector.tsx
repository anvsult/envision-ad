"use client";

import React, { useRef } from "react";
import { Checkbox, ActionIcon, TextInput } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import type { MediaFormState } from "../hooks/useMediaForm";

interface ScheduleSelectorProps {
  formState: MediaFormState;
  onFieldChange: <K extends keyof MediaFormState>(
    field: K,
    value: MediaFormState[K]
  ) => void;
  onDayTimeChange: (day: string, part: "start" | "end", value: string) => void;
}

import { useTranslations } from "next-intl";
// ... imports

export function ScheduleSelector({
  formState,
  onFieldChange,
  onDayTimeChange,
}: ScheduleSelectorProps) {
  const tPage = useTranslations("mediaPage");
  const tForm = useTranslations("mediaModal.form");

  return (
    <>
      <div style={{ height: 18 }} />
      <h3>{tPage("monthsTitle")}</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.keys(formState.activeMonths).map((m) => (
          <Checkbox
            key={m}
            label={tPage(`months.${m.toLowerCase()}` as any)}
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
      <h3>{tForm("daysTimesTitle")}</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 1fr",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div />
        <strong>{tForm("startTimeLabel")}</strong>
        <strong>{tForm("endTimeLabel")}</strong>
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((d) => (
          <Row
            key={d}
            weekDay={d}
            weekDayLabel={tPage(`days.${d.toLowerCase()}` as any)}
            formState={formState}
            onFieldChange={onFieldChange}
            onDayTimeChange={onDayTimeChange}
            closedLabel={tPage("days.closed")}
          />
        ))}
      </div>
    </>
  );
}

function Row({
  weekDay,
  weekDayLabel,
  formState,
  onFieldChange,
  onDayTimeChange,
  closedLabel,
}: {
  weekDay: string;
  weekDayLabel: string;
  formState: MediaFormState;
  onFieldChange: any;
  onDayTimeChange: any;
  closedLabel: string;
}) {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const isActive = !!formState.activeDaysOfWeek[weekDay];

  const handlePickerClick = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      try {
        ref.current.showPicker();
      } catch (error) {
        // Fallback/ignore if browser doesn't support
        console.warn('Time picker not supported:', error);
      }
    }
  };

  const pickerControl = (ref: React.RefObject<HTMLInputElement | null>) => (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => handlePickerClick(ref)}
      disabled={!isActive}
    >
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  const handleTimeChange = (type: "start" | "end", value: string) => {
    // Clean input and apply auto-colon heuristic for time entry (e.g., "12" -> "12:").
    let cleaned = value.replace(/[^0-9:]/g, "");

    // Clamping logic
    const colonCount = (cleaned.match(/:/g) || []).length;
    if (colonCount > 1) return;

    let [hours, minutes] = cleaned.split(":");

    // Clamp Hours
    if (hours && hours.length > 0) {
      if (hours.length > 2) hours = hours.slice(0, 2);
      let h = parseInt(hours, 10);
      if (isNaN(h)) h = 0;
      if (h > 23) {
        hours = "23";
      }
    }

    // Clamp Minutes
    if (minutes && minutes.length > 0) {
      if (minutes.length > 2) minutes = minutes.slice(0, 2);
      let m = parseInt(minutes, 10);
      if (isNaN(m)) m = 0;
      if (m > 59) {
        minutes = "59";
      }
    }

    // Reassemble
    let res = hours;
    if (cleaned.includes(":")) {
      res += ":";
      if (minutes !== undefined) res += minutes;
    }

    if (res.length > 5) res = res.slice(0, 5);

    // Ref-based auto-colon check
    // We need to compare with current form state to see if we added chars
    const currentVal = formState.dailyOperatingHours[weekDay]?.[type] || "";
    if (cleaned.length === 2 && !cleaned.includes(":") && cleaned.length > currentVal.length) {
      res += ":";
    }

    onDayTimeChange(weekDay, type, res);
  };

  return (
    <React.Fragment>
      <Checkbox
        label={weekDayLabel}
        checked={isActive}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onFieldChange("activeDaysOfWeek", {
            ...formState.activeDaysOfWeek,
            [weekDay]: (e.target as HTMLInputElement).checked,
          })
        }
      />

      {/* Start Time */}
      <div style={{ position: "relative" }}>
        <TextInput
          placeholder={isActive ? "00:00" : closedLabel}
          disabled={!isActive}
          value={formState.dailyOperatingHours[weekDay]?.start ?? ""}
          onChange={(e) => handleTimeChange("start", e.currentTarget.value)}
          rightSection={pickerControl(startRef)}
        />
        <input
          type="time"
          ref={startRef}
          style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, padding: 0, border: 0, opacity: 0 }}
          tabIndex={-1}
          value={formState.dailyOperatingHours[weekDay]?.start ?? ""}
          onChange={(e) => onDayTimeChange(weekDay, "start", e.target.value)}
        />
      </div>

      {/* End Time */}
      <div style={{ position: "relative" }}>
        <TextInput
          placeholder={isActive ? "00:00" : closedLabel}
          disabled={!isActive}
          value={formState.dailyOperatingHours[weekDay]?.end ?? ""}
          onChange={(e) => handleTimeChange("end", e.currentTarget.value)}
          rightSection={pickerControl(endRef)}
        />
        <input
          type="time"
          ref={endRef}
          style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, padding: 0, border: 0, opacity: 0 }}
          tabIndex={-1}
          value={formState.dailyOperatingHours[weekDay]?.end ?? ""}
          onChange={(e) => onDayTimeChange(weekDay, "end", e.target.value)}
        />
      </div>
    </React.Fragment>
  );
}
