import axiosInstance from "@/shared/api/axios/axios";

export const createPaymentIntent = async (params: {
    mediaId: string;
    campaignId: string;
    startDate: string;
    endDate: string;
    reservationId: string;
}) => {
    const response = await axiosInstance.post('/payments/create-payment-intent', {
        reservationId: params.reservationId,
        mediaId: params.mediaId,
        campaignId: params.campaignId,
        startDate: params.startDate,
        endDate: params.endDate
        // backend calculates price from media data for security
    });
    return response.data;
};