import axiosInstance from "@/shared/api/axios/axios";
import { ReservationResponseDTO } from "@/entities/reservation";

export const getReservationById = async (reservationId: string): Promise<ReservationResponseDTO> => {
    const response = await axiosInstance.get(`/media/reservations/${reservationId}`);
    return response.data;
};