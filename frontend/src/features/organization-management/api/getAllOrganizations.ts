import { OrganizationResponseDTO } from "@/entities/organization";
import axiosInstance from "@/shared/api/axios/axios";

export const getAllOrganizations = async (): Promise<OrganizationResponseDTO[]> => {
    const response = await axiosInstance.get(`/businesses`);
    return response.data;
};
