import { Media, MediaRequestDTO } from "@/entities/media"
import { getAccessToken } from "@auth0/nextjs-auth0";

const API_BASE_URL = 'http://localhost:8080/api/v1';

export async function updateMedia(id: string, media: Partial<MediaRequestDTO>): Promise<Media> {
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