import { OrganizationResponseDTO } from "@/entities/organization";
import { getAccessToken } from "@auth0/nextjs-auth0";

const API_BASE_URL = "http://localhost:8080/api/v1/businesses";

export const getOrganizationById = async (id: string): Promise<OrganizationResponseDTO> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch organization: ${res.statusText}`);
    }

    return res.json();
};

