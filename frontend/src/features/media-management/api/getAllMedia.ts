import { Media } from "@/entities/media"
import axiosInstance from "@/shared/api/axios/axios";

export async function getAllMedia(): Promise<Media[]> {
    const response = await axiosInstance.get(`/media`);
    return response.data;
}