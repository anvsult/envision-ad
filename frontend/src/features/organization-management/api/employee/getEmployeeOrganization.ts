import { OrganizationResponseDTO } from "@/entities/organization";
import axiosInstance from "@/shared/api/axios/axios";

export const getEmployeeOrganization = async (id: string): Promise<OrganizationResponseDTO> => {
    const response = await axiosInstance.get(`/businesses/employee/${encodeURIComponent(id)}`);
    return response.data;
};