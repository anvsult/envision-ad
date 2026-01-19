import axiosInstance from "@/shared/api/axios/axios";
import { ReservationResponseDTO } from "@/entities/reservation";

export const getMediaReservations = async (mediaId: string): Promise<ReservationResponseDTO[]> => {
    const response = await axiosInstance.get(`/media/${mediaId}/reservations`);
    return response.data;
};

