import {ReservationResponseDTO} from "@/entities/reservation";
import axiosInstance from "@/shared/api/axios/axios";
import {DenialDetails} from "@/entities/reservation/model/reservation";

export const denyReservation = async (
    mediaId: string,
    reservationId: string,
    denialDetails: DenialDetails,
): Promise<ReservationResponseDTO> => {
    const response = await axiosInstance.patch(`/media/${mediaId}/reservations/${reservationId}/deny`, denialDetails);
    return response.data;
};