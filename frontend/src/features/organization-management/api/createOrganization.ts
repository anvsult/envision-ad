import { OrganizationRequestDTO, OrganizationResponseDTO } from "@/entities/organization";
import {axiosInstance} from "@/shared/api";

export const createOrganization = async (
    data: OrganizationRequestDTO
): Promise<OrganizationResponseDTO> => {
    const response = await axiosInstance.post("/businesses/", data);
    return response.data;
};



// import { OrganizationRequestDTO, OrganizationResponseDTO } from "@/entities/organization";
// import { getAccessToken } from "@auth0/nextjs-auth0";
//
// const API_BASE_URL = "http://localhost:8080/api/v1/businesses";
//
// export const createOrganization = async (
//     data: OrganizationRequestDTO
// ): Promise<OrganizationResponseDTO> => {
//     const token = await getAccessToken();
//     const res = await fetch(API_BASE_URL, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(data),
//     });
//
//     if (!res.ok) {
//         throw new Error(`Failed to create organization: ${res.statusText}`);
//     }
//
//     return res.json();
// };
//
