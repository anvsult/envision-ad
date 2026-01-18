import { ReservationRequestDTO, ReservationResponseDTO } from "@/entities/reservation";
import axiosInstance from "@/shared/api/axios/axios";

export const createReservation = async (
    mediaId: string,
    payload: ReservationRequestDTO
): Promise<ReservationResponseDTO> => {

    const response = await axiosInstance.post(`/media/${mediaId}/reservations`, payload);
    return response.data;
};