export interface ReservationRequestDTO {
    campaignId: string;
    startDate: string;  // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
    endDate: string;    // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
}

export interface ReservationResponseDTO {
    reservationId: string;
    mediaId: string;
    campaignId: string;
    campaignName?: string;
    status: ReservationStatus;
    denialDetails: DenialDetails | null;
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

export interface DenialDetails {
    reason: DenialReason;
    description: string | null;
}

export enum DenialReason {
    CONTENT_POLICY = "CONTENT_POLICY",
    CREATIVE_TECHNICAL = "CREATIVE_TECHNICAL",
    LEGAL_COMPLIANCE = "LEGAL_COMPLIANCE",
    MEDIA_OWNER_RULES = "MEDIA_OWNER_RULES",
    LOCAL_VENUE = "LOCAL_VENUE",
    OTHER = "OTHER"
}