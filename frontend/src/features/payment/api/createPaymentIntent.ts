import axiosInstance from "@/shared/api/axios/axios";

export const createPaymentIntent = async (params: {
    mediaId: string;
    campaignId: string;
    amount: number;
    businessId: string;
}) => {
    const response = await axiosInstance.post('/payments/create-payment-intent', {
        reservationId: `temp-${Date.now()}`, // Temporary ID
        // Normalize amount so backend applies the 100× scaling only once
        amount: params.amount / 100,
        mediaId: params.mediaId,
        campaignId: params.campaignId,
        businessId: params.businessId
    });
    return response.data;
};