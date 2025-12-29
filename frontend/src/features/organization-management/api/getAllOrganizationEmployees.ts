import { Employee } from "@/entities/organization";
import {axiosInstance} from "@/shared/api";

export const getAllOrganizationEmployees = async (organizationId: string): Promise<Employee[]> => {
    const response = await axiosInstance.get(`/businesses/${organizationId}/employees`);
    return response.data;
};


// import { Employee } from "@/entities/organization";
// import { getAccessToken } from "@auth0/nextjs-auth0";
//
// const API_BASE_URL = "http://localhost:8080/api/v1/businesses";
//
// export const getAllOrganizationEmployees = async (organizationId: string): Promise<Employee[]> => {
//     const token = await getAccessToken();
//     const res = await fetch(`${API_BASE_URL}/${organizationId}/employees`, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//         },
//         cache: "no-store",
//     });
//
//     if (!res.ok) {
//         throw new Error(`Failed to get organization employees: ${res.statusText}`);
//     }
//
//     return res.json();
// };
