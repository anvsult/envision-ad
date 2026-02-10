"use client";

import {Button, Modal, ScrollArea, Grid, Text} from "@mantine/core";
import {useMemo} from "react";
import {IconUpload} from "@tabler/icons-react";
import {CldUploadWidget, CloudinaryUploadWidgetResults} from "next-cloudinary";
import {notifications} from "@mantine/notifications";
import {MediaDetailsForm} from "./MediaDetailsForm";
import {ScheduleSelector} from "./ScheduleSelector";
import {ImageCornerSelector} from "../components/ImageCornerSelector";
import type {MediaFormState} from "@/pages/dashboard/media-owner/hooks/useMediaForm";
import {useTranslations} from "next-intl";

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

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_SQUARE_IMAGES) {
        throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_SQUARE_IMAGES environment variable is not set');
    }

    // Cloudinary Widget Options
    const widgetOptions = {
        sources: ['local', 'url'] as ('local' | 'url')[],
        resourceType: 'image',
        multiple: false,
        maxFileSize: 10000000,
        cropping: true,
        showSkipCropButton: false, // Prevents users from bypassing the crop
        croppingAspectRatio: 1,
        croppingDefaultSelectionRatio: 1,
        singleUploadAutoClose: true,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_SQUARE_IMAGES
    };

    const handleUploadSuccess = (results: CloudinaryUploadWidgetResults) => {
        if (typeof results.info === 'object' && results.info.secure_url) {
            const secureUrl: string = results.info.secure_url;
            if (secureUrl.startsWith("https://res.cloudinary.com/")) {
                onFieldChange("imageUrl", secureUrl);
            }
        }
    };

    const initialCorners = useMemo(() =>
            formState.previewConfiguration
                ? JSON.parse(formState.previewConfiguration)
                : undefined
        , [formState.previewConfiguration]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={isEditing ? t("title.update") : t("title.create")}
            size="xl"
            centered
            overlayProps={{opacity: 0.55}}
        >
            <ScrollArea style={{height: 600}}>
                <div style={{paddingRight: 8, overflowX: 'hidden'}}>
                    <Grid gutter="xl">
                        {/* LEFT COLUMN: FORM */}
                        <Grid.Col span={{base: 12, md: 6}}>
                            <MediaDetailsForm
                                formState={formState}
                                onFieldChange={onFieldChange}
                            />
                        </Grid.Col>

                        {/* RIGHT COLUMN: UPLOAD */}
                        <Grid.Col span={{base: 12, md: 6}}>
                            <Text size="sm" fw={500} mb={4}>
                                {t("labels.mediaImage")} <span style={{color: "var(--mantine-color-red-6)"}}>*</span>
                            </Text>

                            {!formState.imageUrl ? (
                                <div>
                                    <div style={{
                                        border: '1px solid var(--mantine-color-gray-3)',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        position: 'relative',
                                        backgroundColor: 'var(--mantine-color-gray-0)'
                                    }}>
                                        <CldUploadWidget
                                            signatureEndpoint="/api/cloudinary/sign-upload"
                                            onSuccess={handleUploadSuccess}
                                            options={widgetOptions}
                                        >
                                            {({open}) => (
                                                <div
                                                    style={{
                                                        border: '2px dashed var(--mantine-color-gray-4)',
                                                        borderRadius: '8px',
                                                        height: '300px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        backgroundColor: 'var(--mantine-color-gray-0)',
                                                    }}
                                                    onClick={() => open()}
                                                >
                                                    <IconUpload size={40} color="var(--mantine-color-gray-5)"/>
                                                    <Text size="sm" c="dimmed" mt="sm">
                                                        {t("buttons.uploadFile")}
                                                    </Text>
                                                </div>
                                            )}
                                        </CldUploadWidget>
                                        <Text size="xs" ta="center" mt={4}>
                                            {t("warning.onlySquareImages")}
                                        </Text>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Text size="sm" fw={500} mb={4}>
                                        {t("labels.previewCorners")}
                                    </Text>

                                    <div style={{
                                        border: '1px solid var(--mantine-color-gray-3)',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        position: 'relative',
                                        backgroundColor: 'var(--mantine-color-gray-0)'
                                    }}>
                                        <ImageCornerSelector
                                            imageUrl={formState.imageUrl}
                                            initialCorners={initialCorners}
                                            onChange={(corners) => {
                                                const config = JSON.stringify(corners);
                                                if (config !== formState.previewConfiguration) {
                                                    onFieldChange("previewConfiguration", config);
                                                }
                                            }}
                                        />

                                        <CldUploadWidget
                                            signatureEndpoint="/api/cloudinary/sign-upload"
                                            onSuccess={handleUploadSuccess}
                                            options={widgetOptions}
                                        >
                                            {({open}) => (
                                                <Button
                                                    size="xs"
                                                    variant="default"
                                                    style={{marginTop: 12, width: '100%'}}
                                                    onClick={() => open()}
                                                >
                                                    {t("buttons.changeFile")}
                                                </Button>
                                            )}
                                        </CldUploadWidget>

                                        <Text size="xs" c="dimmed" ta="center" mt={4}>
                                            {t("labels.dragCorners")}
                                        </Text>
                                    </div>
                                </div>
                            )}
                        </Grid.Col>
                    </Grid>

                    <div style={{height: 24}}/>

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
                <Button variant="default" onClick={onClose} style={{marginRight: 8}}>
                    {t("buttons.cancel")}
                </Button>
                <Button onClick={() => {
                    // Validation
                    const newErrors: Record<string, string> = {};

                    if (!formState.mediaTitle.trim()) {
                        newErrors["mediaTitle"] = t("errors.mediaTitleRequired");
                    }

                    if (!formState.imageUrl) {
                        notifications.show({message: t("errors.mediaImageRequired"), color: "red"});
                        return;
                    }

                    if (formState.imageUrl && !formState.previewConfiguration) {
                        notifications.show({message: t("errors.previewCornersRequired"), color: "red"});
                        return;
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
                        notifications.show({message: t("errors.scheduleRequired"), color: "red"});
                        return;
                    }

                    for (const [day, isActive] of Object.entries(formState.activeDaysOfWeek)) {
                        if (isActive) {
                            const {start, end} = formState.dailyOperatingHours[day];
                            if (!start) {
                                newErrors[`${day}_start`] = t("errors.required");
                            }
                            if (!end) {
                                newErrors[`${day}_end`] = t("errors.required");
                            }
                            // String comparison works for time in "HH:mm" format (e.g. "09:00" < "17:00")
                            if (start && end && end <= start) {
                                newErrors[`${day}_end`] = t("errors.startTimeAfterEndTime");
                            }
                        }
                    }

                    if (Object.keys(newErrors).length > 0) {
                        onFieldChange("errors", newErrors);
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
