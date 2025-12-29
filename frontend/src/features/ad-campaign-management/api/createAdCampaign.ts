import {AdCampaign, AdCampaignRequestDTO} from "@/entities/ad-campaign";
import {getAccessToken} from "@auth0/nextjs-auth0";

const API_BASE_URL = "http://localhost:8080/api/v1/ad-campaigns";

export const createAdCampaign = async (
    data: AdCampaignRequestDTO
): Promise<AdCampaign> => {
    const token = await getAccessToken();
    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to create ad campaign: ${res.statusText}`);
    }

    return res.json();
};