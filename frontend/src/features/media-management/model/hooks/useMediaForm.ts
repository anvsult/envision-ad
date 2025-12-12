import { useState } from "react";

export interface MediaFormState {
  mediaTitle: string;
  mediaOwnerName: string;
  resolution: string;
  displayType: string | null;
  loopDuration: string;
  aspectRatio: string;
  widthCm: string;
  heightCm: string;
  weeklyPrice: string;
  dailyImpressions: string;
  mediaAddress: string;
  activeDaysOfWeek: Record<string, boolean>;
  dailyOperatingHours: Record<string, { start: string; end: string }>;
  activeMonths: Record<string, boolean>;
}

const getInitialFormState = (): MediaFormState => ({
  mediaTitle: "",
  mediaOwnerName: "",
  resolution: "",
  displayType: null,
  loopDuration: "",
  aspectRatio: "",
  widthCm: "",
  heightCm: "",
  weeklyPrice: "",
  dailyImpressions: "",
  mediaAddress: "",
  activeDaysOfWeek: {
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
  },
  dailyOperatingHours: {
    Monday: { start: "", end: "" },
    Tuesday: { start: "", end: "" },
    Wednesday: { start: "", end: "" },
    Thursday: { start: "", end: "" },
    Friday: { start: "", end: "" },
    Saturday: { start: "", end: "" },
    Sunday: { start: "", end: "" },
  },
  activeMonths: (() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const obj: Record<string, boolean> = {};
    months.forEach((m) => (obj[m] = true));
    return obj;
  })(),
});

export function useMediaForm() {
  const [formState, setFormState] = useState<MediaFormState>(getInitialFormState());

  const updateField = <K extends keyof MediaFormState>(
    field: K,
    value: MediaFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateDayTime = (day: string, part: "start" | "end", value: string) => {
    setFormState((prev) => ({
      ...prev,
      dailyOperatingHours: {
        ...prev.dailyOperatingHours,
        [day]: {
          ...prev.dailyOperatingHours[day],
          [part]: value,
        },
      },
    }));
  };

  const resetForm = () => {
    setFormState(getInitialFormState());
  };

  return {
    formState,
    updateField,
    updateDayTime,
    resetForm,
    setFormState,
  };
}
