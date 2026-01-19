"use client";

import { useEffect, useState } from "react";
import { getMediaReservations } from "@/features/reservation-management/api/getMediaReservations";

export function useProofStepper(mediaId: string) {
    const [campaigns, setCampaigns] = useState<{ value: string; label: string }[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    useEffect(() => {
        if (!mediaId) return;

        const load = async () => {
            setLoadingCampaigns(true);
            try {
                const reservations = await getMediaReservations(mediaId);

                const map = new Map<string, string>();
                for (const r of reservations) {
                    if (!r.campaignId) continue;
                    if (!map.has(r.campaignId)) {
                        map.set(r.campaignId, r.campaignName ?? r.campaignId);
                    }
                }

                setCampaigns(
                    Array.from(map.entries()).map(([value, label]) => ({ value, label }))
                );
            } catch (err) {
                console.warn("Failed to load reservations:", err);
                setCampaigns([]);
            } finally {
                setLoadingCampaigns(false);
            }
        };

        void load();
    }, [mediaId]);

    return { campaigns, selectedCampaignId, setSelectedCampaignId, loadingCampaigns };
}
