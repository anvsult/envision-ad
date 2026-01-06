import {AdCampaign, AdCampaignRequestDTO} from "@/entities/ad-campaign";
import axiosInstance from "@/shared/api/axios/axios";

export const createAdCampaign = async (
    data: AdCampaignRequestDTO
): Promise<AdCampaign> => {
    const response = await axiosInstance.post(`/ad-campaigns`, data);
    return response.data;
};