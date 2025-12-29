import { InvitationRequest } from "@/entities/organization";
import {axiosInstance} from "@/shared/api";

export const createInviteEmployeeToOrganization = async (
    organizationId: string,
    invitation: InvitationRequest
): Promise<void> => {
    const response = await axiosInstance.post(`/businesses/${organizationId}/invites`, invitation);
    return response.data;
};


// import { InvitationRequest } from "@/entities/organization";
// import { getAccessToken } from "@auth0/nextjs-auth0";
//
// const API_BASE_URL = "http://localhost:8080/api/v1/businesses";
//
// export const createInviteEmployeeToOrganization = async (
//     organizationId: string,
//     invitation: InvitationRequest
// ): Promise<void> => {
//     const token = await getAccessToken();
//     const res = await fetch(`${API_BASE_URL}/${organizationId}/invites`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(invitation)
//     });
//
//     if (!res.ok) {
//         throw new Error(`Failed to invite to organization: ${res.statusText}`);
//     }
//
//     return res.json();
// };
//
