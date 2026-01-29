import axiosInstance from "@/shared/api/axios/axios";

export const getStripeAccountStatus = async (businessId: string) => {
    const response = await axiosInstance.get('/payments/account-status', {
        params: { businessId }
    });
    return response.data;
};

export const connectStripeAccount = async (businessId: string, returnUrl: string, refreshUrl: string) => {
    const response = await axiosInstance.post('/payments/connect-account', {
        businessId,
        returnUrl,
        refreshUrl
    });
    return response.data;
};

