import { MediaDTO, MediaRequest, MediaResponse } from "@/types/MediaTypes";
import { LatLngLiteral } from "leaflet";
import { getAccessToken } from "@auth0/nextjs-auth0";

const API_BASE_URL = 'http://localhost:8080/api/v1';



export async function getAllMedia(): Promise<MediaDTO[]> {
    const response = await fetch(`${API_BASE_URL}/media`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.statusText}`);
    }

    return response.json();
}

function escapeLike(input: string): string {
    return input
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
}

export enum SpecialSort {
    nearest = "nearest",
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
    ): Promise<MediaResponse> {
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

export async function addMedia(media: Omit<MediaRequest, 'id'>): Promise<MediaDTO> {
    const token = await getAccessToken();
    const response = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(media),
    });

    if (!response.ok) {
        throw new Error(`Failed to create media: ${response.statusText}`);
    }

    return response.json();
}

export async function getMediaById(id: string): Promise<MediaDTO> {
    const response = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.statusText}`);
    }

    return response.json();
}

export async function updateMedia(id: string, media: Partial<MediaRequest>): Promise<MediaDTO> {
    const token = await getAccessToken();
    const response = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(media),
    });

    if (!response.ok) {
        throw new Error(`Failed to update media: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteMedia(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete media: ${response.statusText}`);
    }
}