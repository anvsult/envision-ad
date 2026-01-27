import axiosInstance from "@/shared/api/axios/axios";

export const checkPaymentStatus = async (paymentIntentId: string | null) => {
    const response = await axiosInstance.get(`/payments/status/${paymentIntentId}`);
    return response.data;
}
