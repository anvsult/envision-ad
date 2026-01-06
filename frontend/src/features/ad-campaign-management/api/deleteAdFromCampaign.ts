import {getAccessToken} from "@auth0/nextjs-auth0";
import axiosInstance from "@/shared/api/axios/axios";

export const deleteAdFromCampaign = async (
    campaignId: string,
    adId: string
): Promise<void> => {
    const response = await axiosInstance.delete(`/ad-campaigns}/${campaignId}/ads/${adId}`);
    return response.data;
};