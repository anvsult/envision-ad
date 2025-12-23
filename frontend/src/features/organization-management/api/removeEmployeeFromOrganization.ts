import { getAccessToken } from "@auth0/nextjs-auth0";

const API_BASE_URL = "http://localhost:8080/api/v1/businesses";

export const removeEmployeeFromOrganization = async (
    organizationId: string,
    employeeId: string
): Promise<void> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${organizationId}/employees/${encodeURI(employeeId)}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to remove employee from organization: ${res.statusText}`);
    }
};

