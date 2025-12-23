import { MediaListResponseDTO } from "@/entities/media";
import { LatLngLiteral } from "leaflet";

const API_BASE_URL = 'http://localhost:8080/api/v1';

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
    title?: string | null,
    minPrice?: number | null,
    maxPrice?: number | null,
    minDailyImpressions?: number | null,
    sort?: string | null,
    userLatLng?: LatLngLiteral | null,
    page?: number,
    size?: number
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


    if (userLatLng && userLatLng.lat != null && userLatLng.lng != null) {
        params.append("userLat", userLatLng.lat.toString());
        params.append("userLng", userLatLng.lng.toString());
    }

    if (page) {
        params.append("page", page.toString());
    }

    if (size) {
        params.append("size", size.toString());
    }

    const url = `${API_BASE_URL}/media/active?${params.toString()}`;

    const response = await fetch(url, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.statusText}`);
    }

    return response.json();
}
