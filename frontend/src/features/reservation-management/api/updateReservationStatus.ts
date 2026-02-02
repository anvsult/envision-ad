import {ReservationResponseDTO} from "@/entities/reservation";
import axiosInstance from "@/shared/api/axios/axios";
import {ReservationStatus} from "@/entities/reservation/model/reservation";

export const updateReservationStatus = async (
    mediaId: string,
    reservationId: string,
    status: ReservationStatus
): Promise<ReservationResponseDTO> => {
    const response = await axiosInstance.patch(`/media/${mediaId}/reservations/${reservationId}`, null, {
        params: { status }
    });
    return response.data;
};