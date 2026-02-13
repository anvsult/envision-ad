import axiosInstance from "@/shared/api/axios/axios";
import { MediaLocation, MediaLocationRequestDTO } from "@/entities/media-location/model/mediaLocation";

const BASE_URL = "/media-locations";

export const createMediaLocation = async (payload: MediaLocationRequestDTO): Promise<MediaLocation> => {
    const response = await axiosInstance.post(BASE_URL, payload);
    return response.data;
};
