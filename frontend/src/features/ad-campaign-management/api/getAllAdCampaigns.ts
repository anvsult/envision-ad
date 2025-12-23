import {AdCampaign} from "@/entities/ad-campaign";
import { api } from "@/shared/api";

export const getAllAdCampaigns = async (): Promise<AdCampaign[]> => {
    const response = await api.get<AdCampaign[]>(`/api/v1/ad-campaigns`);

    return response.data;
};