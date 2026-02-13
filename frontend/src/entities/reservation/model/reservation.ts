export interface ReservationRequestDTO {
    campaignId: string;
    startDate: string;  // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
    endDate: string;    // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
}

export interface ReservationResponseDTO {
    reservationId: string;
    mediaId: string;
    mediaTitle?: string;
    mediaCity?: string;
    campaignId: string;
    campaignName?: string;
    advertiserBusinessId?: string;
    advertiserBusinessName?: string;
    status: ReservationStatus;
    totalPrice: number;
    startDate: string;
    endDate: string;
}

export enum ReservationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    DENIED = "DENIED",
    CONFIRMED = "CONFIRMED"
}
