import axiosInstance from "@/shared/api/axios/axios";
import { MediaLocation, MediaLocationRequestDTO } from "@/entities/media-location/model/mediaLocation";

const BASE_URL = "/media-locations";

export const updateMediaLocation = async (id: string, payload: MediaLocationRequestDTO): Promise<MediaLocation> => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, payload);
    return response.data;
};
