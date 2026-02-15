import axiosInstance from "@/shared/api/axios/axios";
import type { Media } from "@/entities/media";
import type { MediaStatusEnum } from "@/entities/media/model/media";

export type PatchMediaStatusDTO = { status: MediaStatusEnum };

export async function patchMediaStatus(
    id: string,
    dto: PatchMediaStatusDTO
): Promise<Media> {
    const res = await axiosInstance.patch(`/media/${id}/status`, dto);
    return res.data;
}
