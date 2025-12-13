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

    const validateForm = (t: (key: string, params?: any) => string): string | null => {
        if (!formState.mediaTitle.trim()) return t("errors.titleRequired");
        // owner is auto-filled but good to check
        if (!formState.mediaAddress.trim()) return t("errors.addressRequired");
        if (!formState.displayType) return t("errors.displayTypeRequired");

        if (formState.displayType === "DIGITAL") {
            if (!formState.loopDuration) return t("errors.loopDurationRequired");
            if (!formState.resolution) return t("errors.resolutionRequired");
        } else if (formState.displayType === "POSTER") {
            if (!formState.widthCm) return t("errors.widthRequired");
            if (!formState.heightCm) return t("errors.heightRequired");
        }

        if (!formState.weeklyPrice) return t("errors.priceRequired");
        if (!formState.dailyImpressions) return t("errors.impressionsRequired");

        // Schedule validation
        const hasActiveDay = Object.values(formState.activeDaysOfWeek).some((isActive) => isActive);
        if (!hasActiveDay) return t("errors.atLeastOneDayRequired");

        for (const [day, isActive] of Object.entries(formState.activeDaysOfWeek)) {
            if (isActive) {
                const { start, end } = formState.dailyOperatingHours[day];
                if (!start || !end) return t("errors.timeRequiredForDay", { day: day });
                if (start >= end) return t("errors.invalidTimeRangeForDay", { day: day });
            }
        }

        const hasActiveMonth = Object.values(formState.activeMonths).some((isActive) => isActive);
        if (!hasActiveMonth) return t("errors.atLeastOneMonthRequired");

        return null; // No errors
    };

    return {
        formState,
        updateField,
        updateDayTime,
        resetForm,
        setFormState,
        validateForm,
    };
}
