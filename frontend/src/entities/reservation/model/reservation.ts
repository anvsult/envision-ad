export interface ReservationRequestDTO {
    mediaId: string;
    campaignId: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

export interface ReservationResponseDTO {
    reservationId: string;
    status: string;
    totalPrice: number;
    startDate: string;
    endDate: string;
}