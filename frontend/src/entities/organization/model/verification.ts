export enum VerificationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    DENIED = "DENIED"
}

export interface VerificationResponseDTO {
    verificationId: string;
    businessId: string;
    status: VerificationStatus;
    comments: string;
    dateCreated: string;
    dateUpdated: string;
}