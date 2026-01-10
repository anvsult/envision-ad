import {AdCampaign} from "@/entities/ad-campaign";
import axiosInstance from "@/shared/api/axios/axios";

export const getAllAdCampaigns = async (): Promise<AdCampaign[]> => {
    const response = await axiosInstance.get<AdCampaign[]>(`/ad-campaigns`);

    return response.data;
};