import { useEffect, useState } from "react";
import { getAllAdCampaigns } from "@/features/ad-campaign-management/api/getAllAdCampaigns";
import type { AdCampaign } from "@/entities/ad-campaign";

export function useProofStepper() {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    useEffect(() => {
        setLoadingCampaigns(true);

        getAllAdCampaigns()
            .then(setCampaigns)
            .catch((err) => {
                console.warn("Failed to load ad campaigns:", err);
                setCampaigns([]);
            })
            .finally(() => setLoadingCampaigns(false));
    }, []);

    return {
        campaigns,
        selectedCampaignId,
        setSelectedCampaignId,
        loadingCampaigns,
    };
}
