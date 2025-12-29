import {axiosInstance} from "@/shared/api";

export const cancelInviteEmployeeToOrganization = async (
    organizationId: string,
    invitationId: string
): Promise<void> => {
    const response = await axiosInstance.get(`businesses/${organizationId}/invites/${invitationId}`);
    return response.data;
};

// import { getAccessToken } from "@auth0/nextjs-auth0";
//
// const API_BASE_URL = "http://localhost:8080/api/v1/businesses";
//
// export const cancelInviteEmployeeToOrganization = async (
//     organizationId: string,
//     invitationId: string
// ): Promise<void> => {
//     const token = await getAccessToken();
//     const res = await fetch(`${API_BASE_URL}/${organizationId}/invites/${invitationId}`, {
//         method: "DELETE",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//         }
//     });
//
//     if (!res.ok) {
//         throw new Error(`Failed to cancel invitation: ${res.statusText}`);
//     }
// };
//
