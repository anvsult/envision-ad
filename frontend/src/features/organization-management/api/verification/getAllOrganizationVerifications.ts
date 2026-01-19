import {VerificationResponseDTO} from "@/entities/organization/model/verification";
import axiosInstance from "@/shared/api/axios/axios";

export const getAllOrganizationVerifications = async (
    businessId: string
): Promise<VerificationResponseDTO[]> => {
    const response = await axiosInstance.get(`/businesses/${businessId}/verifications`);
    return response.data;
};