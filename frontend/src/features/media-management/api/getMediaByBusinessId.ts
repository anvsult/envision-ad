import { Media } from "@/entities/media";
import axiosInstance from "@/shared/api/axios/axios";

interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export async function getMediaByBusinessId(businessId: string): Promise<Media[]> {
    // Request a large page size to get all media for now
    const response = await axiosInstance.get<Page<Media>>(`/media/active`, {
        params: {
            businessId,
            size: 100
        }
    });
    return response.data.content;
}
