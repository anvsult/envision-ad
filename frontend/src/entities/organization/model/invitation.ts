export interface InvitationRequest {
    email: string;
}

export interface InvitationResponse {
    invitationId: string;
    email: string;
    timeExpires: string;
}