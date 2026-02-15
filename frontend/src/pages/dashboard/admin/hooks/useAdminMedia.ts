"use client";

import { MediaStatusEnum } from "@/entities/media/model/media";
import { patchMediaStatus } from "@/features/media-management/api/patchMediaStatus";

export function useAdminMedia() {
    const approveMedia = (id: string) =>
        patchMediaStatus(id, { status: MediaStatusEnum.ACTIVE });

    const denyMedia = (id: string) =>
        patchMediaStatus(id, { status: MediaStatusEnum.REJECTED });

    return { approveMedia, denyMedia };
}