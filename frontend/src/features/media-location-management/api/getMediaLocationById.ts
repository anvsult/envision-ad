import axiosInstance from "@/shared/api/axios/axios";
import { MediaLocation } from "@/entities/media-location/model/mediaLocation";

const BASE_URL = "/media-locations";

export const getMediaLocationById = async (id: string): Promise<MediaLocation> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
};
