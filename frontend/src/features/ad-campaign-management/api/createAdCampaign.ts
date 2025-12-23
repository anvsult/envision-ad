import {AdCampaign, AdCampaignRequestDTO} from "@/entities/ad-campaign";
import { api } from "@/shared/api";

export const createAdCampaign = async (
    data: AdCampaignRequestDTO
): Promise<AdCampaign> => {
    const response = await api.post<AdCampaign>(`/api/v1/ad-campaigns`, data);
    return response.data;
};