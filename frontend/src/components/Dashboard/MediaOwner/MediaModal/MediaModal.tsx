"use client";

import { Button, Modal, ScrollArea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { MediaDetailsForm } from "./MediaDetailsForm";
import { ScheduleSelector } from "./ScheduleSelector";
import type { MediaFormState } from "../hooks/useMediaForm";
import { useTranslations } from "next-intl";

// Why do we need this?
interface MediaModalProps {
    opened: boolean;
    onClose: () => void;
    onSave: () => void;
    formState: MediaFormState;
    onFieldChange: <K extends keyof MediaFormState>(
        field: K,
        value: MediaFormState[K]
    ) => void;
    onDayTimeChange: (day: string, part: "start" | "end", value: string) => void;
    isEditing: boolean;
}

export function MediaModal({
    opened,
    onClose,
    onSave,
    formState,
    onFieldChange,
    onDayTimeChange,
    isEditing,
}: MediaModalProps) {
    const t = useTranslations("mediaModal");

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={isEditing ? t("title.update") : t("title.create")}
            size="lg"
            centered
            overlayProps={{ opacity: 0.55 }}
        >
            <ScrollArea style={{ height: 420 }}>
                <div style={{ paddingRight: 8 }}>
                    <MediaDetailsForm
                        formState={formState}
                        onFieldChange={onFieldChange}
                    />

                    <ScheduleSelector
                        formState={formState}
                        onFieldChange={onFieldChange}
                        onDayTimeChange={onDayTimeChange}
                    />
                </div>
            </ScrollArea>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 12,
                }}
            >
                <Button variant="default" onClick={onClose} style={{ marginRight: 8 }}>
                    {t("buttons.cancel")}
                </Button>
                <Button onClick={() => {
                    // Validation
                    const newErrors: Record<string, string> = {};

                    if (!formState.mediaTitle.trim()) {
                        newErrors["mediaTitle"] = t("errors.mediaTitleRequired");
                    }

                    if (formState.displayType === 'DIGITAL') {
                        if (!formState.loopDuration) {
                            newErrors["loopDuration"] = t("errors.loopDurationRequired");
                        }
                        if (!formState.resolution.trim() || !/^\d+x\d+$/.test(formState.resolution)) {
                            newErrors["resolution"] = t("errors.resolutionRequired");
                        }
                        if (!formState.aspectRatio.trim() || !/^\d+:\d+$/.test(formState.aspectRatio)) {
                            newErrors["aspectRatio"] = t("errors.aspectRatioRequired");
                        }
                    } else if (formState.displayType === 'POSTER') {
                        if (!formState.widthCm) {
                            newErrors["widthCm"] = t("errors.widthRequired");
                        }
                        if (!formState.heightCm) {
                            newErrors["heightCm"] = t("errors.heightRequired");
                        }
                    }

                    if (!formState.weeklyPrice) {
                        newErrors["weeklyPrice"] = t("errors.priceRequired");
                    }
                    if (!formState.dailyImpressions) {
                        newErrors["dailyImpressions"] = t("errors.impressionsRequired");
                    }

                    const hasActiveDay = Object.values(formState.activeDaysOfWeek).some(v => v);
                    if (!hasActiveDay) {
                        notifications.show({ message: t("errors.scheduleRequired"), color: "red" });
                        return;
                    }

                    for (const [day, isActive] of Object.entries(formState.activeDaysOfWeek)) {
                        if (isActive) {
                            const { start, end } = formState.dailyOperatingHours[day];
                            if (!start) {
                                newErrors[`${day}_start`] = t("errors.required");
                            }
                            if (!end) {
                                newErrors[`${day}_end`] = t("errors.required");
                            }
                            if (start && end && end <= start) {
                                newErrors[`${day}_end`] = t("errors.startTimeAfterEndTime");
                            }
                        }
                    }

                    if (Object.keys(newErrors).length > 0) {
                        onFieldChange("errors", newErrors);
                        // notifications.show({ message: t("errors.fixForm"), color: "red" });
                        return;
                    }

                    // Clear errors if any existed previously
                    onFieldChange("errors", {});
                    onSave();
                }}>{t("buttons.save")}</Button>
            </div>
        </Modal>
    );
}
