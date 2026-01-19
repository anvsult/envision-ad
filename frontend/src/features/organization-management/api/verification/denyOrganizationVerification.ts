import {VerificationResponseDTO} from "@/entities/organization/model/verification";
import axiosInstance from "@/shared/api/axios/axios";

export const denyOrganizationVerification = async (
    businessId: string,
    verificationId: string,
    reason: string
): Promise<VerificationResponseDTO> => {
    const response = await axiosInstance.patch(
        `/businesses/${businessId}/verifications/${verificationId}/deny`,
        reason,
        {
            headers: {
                'Content-Type': 'text/plain'
            }
        }
    );
    return response.data;
};