import { Employee } from "@/entities/organization";
import axiosInstance from "@/shared/api/axios/axios";

export const getAllOrganizationEmployees = async (organizationId: string): Promise<Employee[]> => {
    const response = await axiosInstance.get(`/businesses/${organizationId}/employees`);
    return response.data;
};

