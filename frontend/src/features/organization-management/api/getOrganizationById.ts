import { OrganizationResponseDTO } from "@/entities/organization";
import axiosInstance from "@/shared/api/axios/axios";

export const getOrganizationById = async (id: string): Promise<OrganizationResponseDTO> => {
    const response = await axiosInstance.get(`/businesses/${id}`);
    return response.data;
};

