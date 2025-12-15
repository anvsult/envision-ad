export interface CreateReservationPayload {
    mediaId: string;
    campaignId: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

export interface ReservationResponse {
    reservationId: string;
    status: string;
    totalPrice: number;
    startDate: string;
    endDate: string;
}