import axiosInstance from "@/shared/api/axios/axios";

export const deleteVenue = async (venueId: string): Promise<void> => {
    await axiosInstance.delete(`/venues/${venueId}`);
};
