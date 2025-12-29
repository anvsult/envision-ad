import {axiosInstance} from "@/shared/api";

export const addEmployeeToOrganization = async (
    organizationId: string,
    token: string
): Promise<void> => {
    const response = await axiosInstance.post(`/businesses/${organizationId}/employees?token=${token}`);
    return response.data;
}

// import { getAccessToken } from "@auth0/nextjs-auth0";
//
// const API_BASE_URL = "http://localhost:8080/api/v1/businesses";
//
// export const addEmployeeToOrganization = async (
//     organizationId: string,
//     token: string
// ): Promise<void> => {
//     const authToken = await getAccessToken();
//     const res = await fetch(`${API_BASE_URL}/${organizationId}/employees?token=${token}`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${authToken}`
//         },
//     });
//
//     if (!res.ok) {
//         throw new Error(`Failed to join organization: ${res.statusText}`);
//     }
// };
//
