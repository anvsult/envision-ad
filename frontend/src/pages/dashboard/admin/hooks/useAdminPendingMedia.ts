"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllMedia } from "@/features/media-management/api";
import type { Media } from "@/entities/media";
import { MediaStatusEnum } from "@/entities/media/model/media";

export function useAdminPendingMedia() {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAllMedia()
            .then((data) => setMedia((data ?? []).filter((m): m is Media => !!m?.id)))
            .catch((e) => setError(e instanceof Error ? e.message : "Failed to load media"))
            .finally(() => setLoading(false));
    }, []);

    const pendingMedia = useMemo(
        () => media.filter((m) => m.status === MediaStatusEnum.PENDING),
        [media]
    );

    return { media: pendingMedia, loading, error };
}
