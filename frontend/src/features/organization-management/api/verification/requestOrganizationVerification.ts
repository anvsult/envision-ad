import {VerificationResponseDTO} from "@/entities/organization/model/verification";
import axiosInstance from "@/shared/api/axios/axios";

export const requestOrganizationVerification = async (
    businessId: string
): Promise<VerificationResponseDTO> => {
    const response = await axiosInstance.post(`/businesses/${businessId}/verifications`);
    return response.data;
};