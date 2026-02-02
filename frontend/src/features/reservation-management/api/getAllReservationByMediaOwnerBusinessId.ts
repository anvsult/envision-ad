import { ReservationResponseDTO } from "@/entities/reservation";
import axiosInstance from "@/shared/api/axios/axios";

export const getAllReservationByMediaOwnerBusinessId = async (
    businessId: string,
): Promise<ReservationResponseDTO[]> => {
    const response = await axiosInstance.get('/media/reservations/media-owner', {
        params: { businessId }
    });
    return response.data;
};