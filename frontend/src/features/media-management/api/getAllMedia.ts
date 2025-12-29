import { Media } from "@/entities/media"

const API_BASE_URL = 'http://localhost:8080/api/v1';

export async function getAllMedia(): Promise<Media[]> {
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