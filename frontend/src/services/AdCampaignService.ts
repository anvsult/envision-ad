import { AdCampaign, Ad, CreateAdPayload } from "@/types/AdTypes";
import { getAccessToken } from "@auth0/nextjs-auth0";
import {CreateAdCampaignPayload} from "@/types/AdCampaignTypes";

const API_BASE_URL = "http://localhost:8080/api/v1/ad-campaigns";

export const getAllAdCampaigns = async (): Promise<AdCampaign[]> => {
    const token = await getAccessToken();
    const res = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        cache: "no-store", // Ensures we get fresh data every time
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch ad campaigns: ${res.statusText}`);
    }

    return res.json();
};

export const createAdCampaign = async (
    data: CreateAdCampaignPayload
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

export const addAdToCampaign = async (
    campaignId: string,
    data: CreateAdPayload
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