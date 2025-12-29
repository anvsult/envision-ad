import {getAccessToken} from "@auth0/nextjs-auth0";
import { MediaRequestDTO, Media } from "@/entities/media"

const API_BASE_URL = 'http://localhost:8080/api/v1';

export async function addMedia(media: Omit<MediaRequestDTO, 'id'>): Promise<Media> {
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