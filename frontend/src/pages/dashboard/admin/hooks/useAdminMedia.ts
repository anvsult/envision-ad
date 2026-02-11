"use client";

import { getMediaById, updateMedia } from "@/features/media-management/api";
import type { MediaRequestDTO, Media } from "@/entities/media";

export function useAdminMedia() {
    const setStatus = async (id: string) => {
        const m: Media = await getMediaById(id);

        // Prefer explicit mediaLocationId if DTO has it, fallback to mediaLocation.id
        const locationId =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (m as any).mediaLocationId ?? m.mediaLocation?.id;

        if (!locationId) {
            throw new Error(
                "Missing mediaLocationId from getMediaById() response (cannot update without location)"
            );
        }

        // Build a payload that backend expects
        const payload: MediaRequestDTO = {
            title: m.title,
            mediaOwnerName: m.mediaOwnerName,
            mediaLocationId: locationId,
            typeOfDisplay: m.typeOfDisplay as MediaRequestDTO["typeOfDisplay"],

            loopDuration: m.loopDuration ?? 0,
            resolution: m.resolution ?? "",
            aspectRatio: m.aspectRatio ?? "",
            width: m.width ?? 0,
            height: m.height ?? 0,
            price: m.price ?? 0,
            dailyImpressions: m.dailyImpressions ?? 0,

            schedule: m.schedule,
            imageUrl: m.imageUrl,
            previewConfiguration: m.previewConfiguration,
        };

        return updateMedia(id, payload as MediaRequestDTO);
    };

    const approveMedia = (id: string) => setStatus(id);
    const denyMedia = (id: string) => setStatus(id);

    return { approveMedia, denyMedia };
}
