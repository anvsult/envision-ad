import {getAccessToken} from "@auth0/nextjs-auth0";
const API_BASE_URL = "http://localhost:8080/api/v1/ad-campaigns";

export const deleteAdFromCampaign = async (
    campaignId: string,
    adId: string
): Promise<void> => {
    const token = await getAccessToken();
    // We construct the URL: /api/v1/adcampaigns/{campaignId}/ads/{adId}
    const res = await fetch(`${API_BASE_URL}/${campaignId}/ads/${adId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to delete ad: ${res.statusText}`);
    }
};