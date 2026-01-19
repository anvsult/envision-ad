import axiosInstance from "@/shared/api/axios/axios";

export const addEmployeeToOrganization = async (
    organizationId: string,
    token: string
): Promise<void> => {
    const response = await axiosInstance.post(`/businesses/${organizationId}/employees?token=${token}`);
    return response.data;
}
