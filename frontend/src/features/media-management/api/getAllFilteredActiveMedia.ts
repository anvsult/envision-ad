import { MediaListResponseDTO } from "@/entities/media";
import axiosInstance from "@/shared/api/axios/axios";
import { FilteredActiveMediaProps } from "@/entities/media/model/media";


export enum SpecialSort {
    nearest = "nearest"
}

export enum SortOptions{
    priceAsc ="price,asc",
    priceDesc ="price,desc",
    dailyImpressionsAsc ="dailyImpressions,asc",
    dailyImpressionsDesc ="dailyImpressions,desc",
    loopDurationAsc ="loopDuration,asc",
    loopDurationDesc ="loopDuration,desc"
}

function escapeLike(input: string): string {
    return input
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
}



export async function getAllFilteredActiveMedia(
    {title, businessId, minPrice, maxPrice, minDailyImpressions, sort, latLng, excludedId, page, size}: FilteredActiveMediaProps
): Promise<MediaListResponseDTO> {
    const params = new URLSearchParams();

    if (title && title.trim() !== "") {
        const escaped = escapeLike(title);
        params.append("title", escaped);
    }

    if (businessId) {
        params.append("businessId", businessId);
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

    if (excludedId) {
        params.append("excludedId", excludedId);
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
