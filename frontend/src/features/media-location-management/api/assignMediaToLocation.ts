import axiosInstance from "@/shared/api/axios/axios";

const BASE_URL = "/media-locations";

export const assignMediaToLocation = async (locationId: string, mediaId: string): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/${locationId}/assign/${mediaId}`);
};
