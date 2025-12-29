'use server';
import {AdCampaign} from "@/entities/ad-campaign";
import { api } from "@/shared/api";

export const getAllAdCampaigns = async (): Promise<AdCampaign[]> => {
    const response = await api.get<AdCampaign[]>(`/ad-campaigns`);

    return response.data;
};