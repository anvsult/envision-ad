import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { MediaStatusEnum } from "@/entities/media/model/media";

import {
    addMedia,
    getMediaByBusinessId,
    getMediaById,
    updateMedia,
    deleteMedia,
} from "@/features/media-management/api";
import { getEmployeeOrganization } from "@/features/organization-management/api";
import type { MediaRowData } from "@/pages/dashboard/media-owner/ui/tables/MediaRow";
import type { MediaFormState } from "./useMediaForm";
import { MediaRequestDTO } from "@/entities/media";
import {patchMediaStatus} from "@/features/media-management/api/patchMediaStatus";

export function useMediaList() {
    const [media, setMedia] = useState<MediaRowData[]>([]);
    const [businessId, setBusinessId] = useState<string | undefined>();
    const { user } = useUser();

    // Fetch businessId on mount
    useEffect(() => {
        if (!user?.sub) return;

        const fetchBusinessId = async () => {
            try {
                const business = await getEmployeeOrganization(user.sub as string);
                if (!business) {
                    throw new Error('Business not found');
                }
                setBusinessId(business.businessId);
            } catch (err) {
                console.error("Failed to load business info:", err);
            }
        };

        fetchBusinessId();
    }, [user]);

    // Fetch media when businessId is available
    useEffect(() => {
        if (!businessId) return;

        getMediaByBusinessId(businessId)
            .then((data) => {
                const items = (data || []).filter((m) => m.id != null);
                const mapped = items.map((m) => ({
                    id: String(m.id),
                    name: m.title,
                    image: m.imageUrl ?? null,
                    adsDisplayed: 0,
                    pending: 0,
                    status: m.status ?? MediaStatusEnum.PENDING,
                    timeUntil: "-",
                    price: `${Number(m.price)}`
                }));
                setMedia(mapped);
            })
            .catch((err) => {
                console.error("Failed to load media:", err);
            });
    }, [businessId]);

    const buildScheduleFromForm = (formState: MediaFormState) => {
        const selectedMonths = Object.keys(formState.activeMonths).filter(
            (m) => formState.activeMonths[m]
        );

        const weeklySchedule = [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ].map(day => ({
            dayOfWeek: day.toLowerCase(),
            isActive: formState.activeDaysOfWeek[day],
            startTime: formState.dailyOperatingHours[day]?.start ?? null,
            endTime: formState.dailyOperatingHours[day]?.end ?? null
        }));

        return {
            selectedMonths,
            weeklySchedule,
        };
    };



    const addNewMedia = async (formState: MediaFormState) => {
        if (!formState.mediaTitle) {
            throw new Error("Please enter a media name");
        }

        const schedule = buildScheduleFromForm(formState);

        const payload: MediaRequestDTO = {
            title: formState.mediaTitle,
            mediaOwnerName: formState.mediaOwnerName,
            mediaLocationId: formState.mediaLocationId,
            typeOfDisplay: formState.displayType,
            loopDuration: Number(formState.loopDuration),
            resolution: formState.resolution,
            aspectRatio: formState.aspectRatio,
            width: Number(formState.widthCm),
            height: Number(formState.heightCm),
            price: Number(formState.weeklyPrice),
            dailyImpressions: Number(formState.dailyImpressions),
            schedule: schedule,
            imageUrl: formState.imageUrl,
            previewConfiguration: formState.previewConfiguration
        };

        try {
            const created = await addMedia(payload as MediaRequestDTO);
            if (!created || created.id == null) {
                throw new Error('Created media did not return an id');
            }
            const newRow: MediaRowData = {
                id: String(created.id),
                name: formState.mediaTitle,
                image: created.imageUrl ?? null,
                adsDisplayed: 0,
                pending: 0,
                status: created.status ?? MediaStatusEnum.PENDING,
                timeUntil: "-",
                price: formState.weeklyPrice ? `$${Number(formState.weeklyPrice).toFixed(2)}` : "$0.00",
            };
            setMedia((prev) => [newRow, ...prev]);
            return created;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error("Failed to save media: " + message);
        }
    };

    const editMedia = async (id: string | number, formState: MediaFormState) => {
        const schedule = buildScheduleFromForm(formState);

        const payload: MediaRequestDTO = {
            title: formState.mediaTitle,
            mediaOwnerName: formState.mediaOwnerName,
            mediaLocationId: formState.mediaLocationId,
            resolution: formState.resolution,
            aspectRatio: formState.aspectRatio,
            loopDuration: Number(formState.loopDuration),
            width: Number(formState.widthCm),
            height: Number(formState.heightCm),
            price: Number(formState.weeklyPrice),
            dailyImpressions: Number(formState.dailyImpressions),
            schedule: schedule,
            typeOfDisplay: formState.displayType,
            imageUrl: formState.imageUrl,
            previewConfiguration: formState.previewConfiguration
        };

        try {
            const updated = await updateMedia(String(id), payload as MediaRequestDTO);
            setMedia((prev) =>
                prev.map((r) =>
                    String(r.id) === String(id)
                        ? {
                            ...r,
                            name: updated.title,
                            image: updated.imageUrl ?? r.image,
                            status: updated.status ?? r.status,
                            price: updated.price ? `${Number(updated.price).toFixed(2)}` : r.price
                        }
                        : r
                )
            );
            return updated;
        } catch (err: unknown) {
            console.error("Failed to update media:", err);
            throw err;
        }
    };

    const deleteMediaById = async (id: string | number) => {
        try {
            await deleteMedia(String(id));
            setMedia((prev) => prev.filter((r) => String(r.id) !== String(id)));
        } catch (err: unknown) {
            console.error("Failed to delete media:", err);
            throw err;
        }
    };

    const fetchMediaById = async (id: string | number) => {
        return getMediaById(String(id));
    };

    // Toggle status
    const toggleMediaStatus = async (id: string | number) => {
        const targetId = String(id);

        const currentRow = media.find((m) => String(m.id) === targetId);
        if (!currentRow) return;

        if (
            currentRow.status === MediaStatusEnum.PENDING ||
            currentRow.status === MediaStatusEnum.REJECTED
        ) {
            console.warn("Cannot toggle status while media is pending approval or rejected");
            return;
        }

        const currentStatus = currentRow.status;
        const nextStatus =
            currentStatus === MediaStatusEnum.ACTIVE
                ? MediaStatusEnum.INACTIVE
                : MediaStatusEnum.ACTIVE;

        // optimistic UI update
        setMedia((prev) =>
            prev.map((m) =>
                String(m.id) === targetId ? { ...m, status: nextStatus } : m
            )
        );

        try {
            const updated = await patchMediaStatus(targetId, { status: nextStatus });

            // sync with backend response
            setMedia((prev) =>
                prev.map((m) =>
                    String(m.id) === targetId
                        ? { ...m, status: updated.status ?? nextStatus }
                        : m
                )
            );

            return updated.status ?? nextStatus;
        } catch (err) {
            // revert on error
            setMedia((prev) =>
                prev.map((m) =>
                    String(m.id) === targetId ? { ...m, status: currentStatus } : m
                )
            );
            throw err;
        }
    };

    return {
        media,
        addNewMedia,
        editMedia,
        deleteMediaById,
        fetchMediaById,
        toggleMediaStatus,
    };
}