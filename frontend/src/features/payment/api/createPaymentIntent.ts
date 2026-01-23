import axiosInstance from "@/shared/api/axios/axios";
import { Dayjs } from 'dayjs';

export const createPaymentIntent = async (params: {
    mediaId: string;
    campaignId: string;
    startDate: Dayjs;
    endDate: Dayjs;
}) => {
    const response = await axiosInstance.post('/payments/create-payment-intent', {
        reservationId: `temp-${Date.now()}`, // Temporary ID
        mediaId: params.mediaId,
        campaignId: params.campaignId,
        startDate: params.startDate.toISOString(),
        endDate: params.endDate.toISOString()
        // backend calculates price from media data for security
    });
    return response.data;
};