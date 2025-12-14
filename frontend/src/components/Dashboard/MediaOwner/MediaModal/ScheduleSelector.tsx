"use client";

import React from "react";
import { Checkbox, TextInput } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import type { MediaFormState } from "../hooks/useMediaForm";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("mediaModal");

  return (
    <>
      <div style={{ height: 18 }} />
      <h3>{t("sections.months")}</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.keys(formState.activeMonths).map((m) => (
          <Checkbox
            key={m}
            label={t(`calendar.months.${m.toLowerCase()}`)}
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
      <h3>{t("sections.schedule")}</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 1fr",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div />
        <strong>{t("sections.start")}</strong>
        <strong>{t("sections.end")}</strong>
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
            formState={formState}
            onFieldChange={onFieldChange}
            onDayTimeChange={onDayTimeChange}
          />
        ))}
      </div>
    </>
  );
}

function Row({
  weekDay,
  formState,
  onFieldChange,
  onDayTimeChange,
}: {
  weekDay: string;
  formState: MediaFormState;
  onFieldChange: any;
  onDayTimeChange: any;
}) {
  const t = useTranslations("mediaModal");
  const isActive = !!formState.activeDaysOfWeek[weekDay];
  const dayLabel = t(`calendar.days.${weekDay.toLowerCase()}`);

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
        label={dayLabel}
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
          placeholder={isActive ? t("placeholders.timeOpen") : t("placeholders.timeClosed")}
          disabled={!isActive}
          value={formState.dailyOperatingHours[weekDay]?.start ?? ""}
          onChange={(e) => handleTimeChange("start", e.currentTarget.value)}
          error={formState.errors[`${weekDay}_start`]}
        />
      </div>

      {/* End Time */}
      <div style={{ position: "relative" }}>
        <TextInput
          placeholder={isActive ? t("placeholders.timeOpen") : t("placeholders.timeClosed")}
          disabled={!isActive}
          value={formState.dailyOperatingHours[weekDay]?.end ?? ""}
          onChange={(e) => handleTimeChange("end", e.currentTarget.value)}
          error={formState.errors[`${weekDay}_end`]}
        />
      </div>
    </React.Fragment>
  );
}
