import axiosInstance from "@/shared/api/axios/axios";

export const deleteAdFromCampaign = async (
    campaignId: string,
    adId: string
): Promise<void> => {
    const response = await axiosInstance.delete(`/ad-campaigns/${campaignId}/ads/${adId}`);
    return response.data;
};