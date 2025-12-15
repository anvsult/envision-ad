"use client";

import { useEffect, useState } from "react";
import { getAllMedia } from "@/services/MediaService";
import type { MediaDTO } from "@/types/MediaTypes";

export function useAdminPendingMedia() {
    const [media, setMedia] = useState<MediaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAllMedia()
            .then((data) => setMedia((data ?? []).filter((m): m is MediaDTO => !!m?.id)))
            .catch((e) => setError(e instanceof Error ? e.message : "Failed to load media"))
            .finally(() => setLoading(false));
    }, []);

    return { media, loading, error };
}
