import { ReservationResponseDTO } from "@/entities/reservation";
import axiosInstance from "@/shared/api/axios/axios";

export const getAllReservationByAdvertiserBusinessId = async (
    businessId: string,
): Promise<ReservationResponseDTO[]> => {
    const response = await axiosInstance.get('/media/reservations/advertiser', {
        params: { businessId }
    });
    return response.data;
};