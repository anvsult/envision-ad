import { MediaListResponseDTO } from "@/entities/media";
import axiosInstance from "@/shared/api/axios/axios";
import { FilteredActiveMediaProps } from "@/entities/media/model/media";


export enum SpecialSort {
    nearest = "nearest",
}

function escapeLike(input: string): string {
    return input
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
}



export async function getAllFilteredActiveMedia(
    {title, minPrice, maxPrice, minDailyImpressions, sort, latLng, page, size}: FilteredActiveMediaProps
): Promise<MediaListResponseDTO> {
    const params = new URLSearchParams();

    if (title && title.trim() !== "") {
        const escaped = escapeLike(title);
        params.append("title", escaped);
    }

    if (minPrice) {
        params.append("minPrice", minPrice.toString());
    }

    if (maxPrice) {
        params.append("maxPrice", maxPrice.toString());
    }

    if (minDailyImpressions) {
        params.append("minDailyImpressions", minDailyImpressions.toString());
    }

    if (sort){
        if (Object.values(SpecialSort).includes(sort as SpecialSort)) {
            params.append("specialSort", sort.toString());
        } else {
            params.append("sort", sort.toString());
        }
    }


    if (latLng && latLng.lat != null && latLng.lng != null) {
        params.append("userLat", latLng.lat.toString());
        params.append("userLng", latLng.lng.toString());
    }

    if (page) {
        params.append("page", page.toString());
    }

    if (size) {
        params.append("size", size.toString());
    }


    const response = await axiosInstance.get(`/media/active?${params.toString()}`);

    return response.data;
}
