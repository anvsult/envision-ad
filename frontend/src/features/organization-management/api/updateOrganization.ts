import { OrganizationRequestDTO, OrganizationResponseDTO } from "@/entities/organization";
import { getAccessToken } from "@auth0/nextjs-auth0";

const API_BASE_URL = "http://localhost:8080/api/v1/businesses";

export const updateOrganization = async (
    id: string,
    data: OrganizationRequestDTO
): Promise<OrganizationResponseDTO> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to update organization: ${res.statusText}`);
    }

    return res.json();
};

