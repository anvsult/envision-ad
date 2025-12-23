import { InvitationResponse } from "@/entities/organization";
import { getAccessToken } from "@auth0/nextjs-auth0";

const API_BASE_URL = "http://localhost:8080/api/v1/businesses";

export const getAllOrganizationInvitations = async (
    organizationId: string
): Promise<InvitationResponse[]> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${organizationId}/invites`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to get organization invitations: ${res.statusText}`);
    }

    return res.json();
};

