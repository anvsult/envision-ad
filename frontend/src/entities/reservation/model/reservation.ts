export interface ReservationRequestDTO {
    campaignId: string;
    startDate: string;  // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
    endDate: string;    // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
}

export interface ReservationResponseDTO {
    reservationId: string;
    campaignId: string;
    campaignName?: string;
    status: string;
    totalPrice: number;
    startDate: string;
    endDate: string;
}