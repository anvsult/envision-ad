import {VerificationResponseDTO} from "@/entities/organization/model/verification";
import axiosInstance from "@/shared/api/axios/axios";

export const approveOrganizationVerification = async (
    businessId: string,
    verificationId: string
): Promise<VerificationResponseDTO> => {
    const response = await axiosInstance.patch(
        `/businesses/${businessId}/verifications/${verificationId}/approve`
    );
    return response.data;
};