import axiosInstance from "@/shared/api/axios/axios";

export async function unassignMediaFromLocation(locationId: string, mediaId: string): Promise<void> {
    await axiosInstance.delete(`/media-locations/${locationId}/media/${mediaId}`);
}
