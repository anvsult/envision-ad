import { OrganizationResponseDTO } from "@/entities/organization";
import axiosInstance from "@/shared/api/axios/axios";
import axios from "axios";


export const getEmployeeOrganization = async (id: string): Promise<OrganizationResponseDTO | null> => {
    try {
        const response = await axiosInstance.get(`/businesses/employee/${encodeURIComponent(id)}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

export const getEmployeeOrganizationServer = async (id: string, token: string): Promise<OrganizationResponseDTO | null> => {
    const baseUrl = process.env.DOCKER === "true" ? process.env.WEBSERVICE_API_URL : process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(
        `${baseUrl}/businesses/employee/${encodeURIComponent(id)}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch employee organization: ${response.statusText}`);
    }

    return response.json();
};