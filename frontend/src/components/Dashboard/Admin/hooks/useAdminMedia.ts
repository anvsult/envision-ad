"use client";

import { getMediaById, updateMedia } from "@/services/MediaService";
import type { MediaRequest, MediaDTO } from "@/types/MediaTypes";

type AdminStatus = "ACTIVE" | "REJECTED";

export function useAdminMedia() {
    const setStatus = async (id: string, status: AdminStatus) => {
        const m: MediaDTO = await getMediaById(id);

        // Prefer explicit mediaLocationId if DTO has it, fallback to mediaLocation.id
        const locationId =
            (m as any).mediaLocationId ?? m.mediaLocation?.id;

        if (!locationId) {
            throw new Error(
                "Missing mediaLocationId from getMediaById() response (cannot update without location)"
            );
        }

        // Build a payload that backend expects
        const payload: MediaRequest = {
            title: m.title,
            mediaOwnerName: m.mediaOwnerName,
            mediaLocationId: locationId,
            typeOfDisplay: m.typeOfDisplay as MediaRequest["typeOfDisplay"],

            loopDuration: m.loopDuration ?? 0,
            resolution: m.resolution ?? "",
            aspectRatio: m.aspectRatio ?? "",
            width: m.width ?? 0,
            height: m.height ?? 0,
            price: m.price ?? 0,
            dailyImpressions: m.dailyImpressions ?? 0,

            schedule: m.schedule,
            status,
        };

        return updateMedia(id, payload as MediaRequest);
    };

    const approveMedia = (id: string) => setStatus(id, "ACTIVE");
    const denyMedia = (id: string) => setStatus(id, "REJECTED");

    return { approveMedia, denyMedia };
}
