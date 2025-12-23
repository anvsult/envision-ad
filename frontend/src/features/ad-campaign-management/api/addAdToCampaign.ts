import {Ad, AdRequestDTO} from "@/entities/ad";
import {getAccessToken} from "@auth0/nextjs-auth0";
const API_BASE_URL = "http://localhost:8080/api/v1/ad-campaigns";

export const addAdToCampaign = async (
    campaignId: string,
    data: AdRequestDTO
): Promise<Ad> => {
    const token = await getAccessToken();
    // We construct the URL: /api/v1/ad-campaigns/{campaignId}/ads
    const res = await fetch(`${API_BASE_URL}/${campaignId}/ads`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to create ad: ${res.statusText}`);
    }

    return res.json();
};