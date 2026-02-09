import { Media } from "@/entities/media";
import axiosInstance from "@/shared/api/axios/axios";


export async function getMediaByBusinessId(businessId: string): Promise<Media[]> {
    // Request all media for the business (active, pending, etc.)
    const response = await axiosInstance.get<Media[]>(`/media`, {
        params: {
            businessId
        }
    });
    return response.data;
}
