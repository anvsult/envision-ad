import axiosInstance from "@/shared/api/axios/axios";
import {VerificationResponseDTO} from "@/entities/organization/model/verification";

export const getAllVerificationRequests = async (): Promise<VerificationResponseDTO[]> => {
    const response = await axiosInstance.get(`/businesses/verifications`);
    return response.data;
};