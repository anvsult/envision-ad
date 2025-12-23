"use client";

import React, { useMemo, useState } from "react";
import { MediaModal } from "@/pages/dashboard/media-owner/ui/modals/MediaModal";
import { MediaTable } from "@/pages/dashboard/advertiser/ui/tables/MediaTable";
import { useMediaList } from "@/pages/dashboard/media-owner/hooks/useMediaList";
import { useMediaForm } from "@/pages/dashboard/media-owner/hooks/useMediaForm";
import { useTranslations } from "next-intl";
import { Box, Button, Drawer, Group, Pagination, Paper, Stack, } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { usePathname } from "@/shared/lib/i18n/navigation";
import SideBar from "@/widgets/SideBar/SideBar";
import { WeeklyScheduleModel } from "@/entities/media";
import { IconCheck } from "@tabler/icons-react";

const ITEMS_PER_PAGE = 20;

export default function MediaOwnerPage() {
    const { media, addNewMedia, editMedia, deleteMediaById, fetchMediaById, toggleMediaStatus } =
        useMediaList();
    const { formState, updateField, updateDayTime, resetForm, setFormState } =
        useMediaForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [opened, { toggle, close }] = useDisclosure(false);
    const pathname = usePathname();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const t = useTranslations("media");

    const handleSave = async () => {
        try {
            if (editingId) {
                await editMedia(editingId, formState);
                notifications.show({
                    title: t("success.title"),
                    message: t("success.update"),
                    color: "green",
                    icon: <IconCheck size="1.1rem" />,
                });
            } else {
                await addNewMedia(formState);
                notifications.show({
                    title: t("success.title"),
                    message: t("success.create"),
                    color: "green",
                    icon: <IconCheck size="1.1rem" />,
                });
            }
            setIsModalOpen(false);
            resetForm();
            setEditingId(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            alert(message);
        }
    };

    const handleEdit = async (id: string | number) => {
        try {
            const backend = await fetchMediaById(id);
            // Map backend DTO to MediaFormState shape
            const schedule = backend.schedule || {
                selectedMonths: [],
                weeklySchedule: [],
            };

            const activeDaysOfWeek: Record<string, boolean> = {
                Monday: false,
                Tuesday: false,
                Wednesday: false,
                Thursday: false,
                Friday: false,
                Saturday: false,
                Sunday: false,
            };

            const dailyOperatingHours: Record<
                string,
                { start: string; end: string }
            > = {
                Monday: { start: "00:00", end: "00:00" },
                Tuesday: { start: "00:00", end: "00:00" },
                Wednesday: { start: "00:00", end: "00:00" },
                Thursday: { start: "00:00", end: "00:00" },
                Friday: { start: "00:00", end: "00:00" },
                Saturday: { start: "00:00", end: "00:00" },
                Sunday: { start: "00:00", end: "00:00" },
            };

            if (schedule.weeklySchedule) {
                schedule.weeklySchedule.forEach((entry: WeeklyScheduleModel) => {
                    // entry.dayOfWeek is likely "monday". We need "Monday"
                    const dayKey =
                        entry.dayOfWeek.charAt(0).toUpperCase() + entry.dayOfWeek.slice(1);
                    if (activeDaysOfWeek.hasOwnProperty(dayKey)) {
                        activeDaysOfWeek[dayKey] = entry.isActive;
                        dailyOperatingHours[dayKey] = {
                            start: entry.startTime ?? "00:00",
                            end: entry.endTime ?? "00:00",
                        };
                    }
                });
            }

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

            const activeMonths: Record<string, boolean> = {};
            months.forEach(
                (m) => (activeMonths[m] = (schedule.selectedMonths || []).includes(m))
            );

            // populate the form
            setFormState({
                mediaTitle: backend.title ?? "",
                mediaOwnerName: backend.mediaOwnerName ?? "",
                mediaLocationId: backend.mediaLocation.id ?? "",
                resolution: backend.resolution ?? "",
                displayType: backend.typeOfDisplay ?? null,
                loopDuration:
                    backend.loopDuration != null ? String(backend.loopDuration) : "",
                aspectRatio: backend.aspectRatio ?? "",
                widthCm: backend.width != null ? String(backend.width) : "",
                heightCm: backend.height != null ? String(backend.height) : "",
                weeklyPrice: backend.price != null ? Number(backend.price).toFixed(2) : "",
                dailyImpressions:
                    backend.dailyImpressions != null
                        ? String(backend.dailyImpressions)
                        : "",
                activeDaysOfWeek,
                dailyOperatingHours,
                activeMonths,
                errors: {},
            });

            setEditingId(String(id));
            setIsModalOpen(true);
        } catch (err) {
            console.error("Failed to fetch media for edit:", err);
            alert(t("errors.loadFailed"));
        }
    };

    const handleDelete = (id: string | number) => {
        modals.openConfirmModal({
            title: t("deleteConfirm.title"),
            centered: true,
            children: t("deleteConfirm.message"),
            labels: {
                confirm: t("deleteConfirm.confirm"),
                cancel: t("deleteConfirm.cancel"),
            },
            confirmProps: { color: "red" },
            onConfirm: async () => {
                try {
                    await deleteMediaById(id);
                } catch (err) {
                    console.error("Failed to delete media:", err);
                    alert(t("errors.deleteFailed"));
                }
            },
        });
    };

    const handleToggleStatus = async (id: string | number) => {
        try {
            await toggleMediaStatus(id);
        } catch (err) {
            console.error("Failed to toggle media status:", err);
            alert(t("errors.statusToggleFailed") || "Failed to change media status.");
        }
    };


    const totalPages = Math.ceil(media.length / ITEMS_PER_PAGE);
    const paginatedMedia = useMemo(() => {
        const start = (activePage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return media.slice(start, end);
    }, [media, activePage]);

    return (
        <>
            <Box>
                <Drawer
                    opened={opened}
                    onClose={close}
                    size="xs"
                    padding="md"
                    hiddenFrom="md"
                    zIndex={1000}
                >
                    <SideBar></SideBar>
                </Drawer>

                <Group align="flex-start" gap={0} wrap="nowrap">
                    {!isMobile && (
                        <Paper
                            w={250}
                            p="md"
                            style={{ minHeight: "calc(100vh - 80px)", borderRadius: 0 }}
                            withBorder
                        >
                            <SideBar></SideBar>
                        </Paper>
                    )}

                    <Stack gap="md" p="md" style={{ flex: 1, minWidth: 0 }}>
                        <Group justify="flex-start">
                            <Button
                                onClick={() => {
                                    setEditingId(null);
                                    resetForm();
                                    setIsModalOpen(true);
                                }}
                            >
                                Add new media
                            </Button>
                        </Group>
                        <MediaModal
                            opened={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setEditingId(null);
                                resetForm();
                            }}
                            onSave={handleSave}
                            isEditing={!!editingId}
                            formState={formState}
                            onFieldChange={updateField}
                            onDayTimeChange={updateDayTime}
                        />

                        <MediaTable
                            rows={paginatedMedia}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                        />
                        {totalPages > 1 && (
                            <Group justify="center" mt="md">
                                <Pagination
                                    total={totalPages}
                                    value={activePage}
                                    onChange={setActivePage}
                                    size="md"
                                />
                            </Group>
                        )}
                    </Stack>
                </Group>
            </Box>
        </>
    );
}

