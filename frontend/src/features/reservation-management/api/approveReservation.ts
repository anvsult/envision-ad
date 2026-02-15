import {ReservationResponseDTO} from "@/entities/reservation";
import axiosInstance from "@/shared/api/axios/axios";

export const approveReservation = async (
    mediaId: string,
    reservationId: string,
): Promise<ReservationResponseDTO> => {
    const response = await axiosInstance.patch(`/media/${mediaId}/reservations/${reservationId}/approve`);
    return response.data;
};