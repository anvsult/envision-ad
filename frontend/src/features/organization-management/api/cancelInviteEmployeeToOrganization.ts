import axiosInstance from "@/shared/api/axios/axios";

export const cancelInviteEmployeeToOrganization = async (
    organizationId: string,
    invitationId: string
): Promise<void> => {
    const response = await axiosInstance.get(`businesses/${organizationId}/invites/${invitationId}`);
    return response.data;
};