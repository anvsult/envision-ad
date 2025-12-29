
const API_BASE_URL = 'http://localhost:8080/api/v1';

export async function deleteMedia(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete media: ${response.statusText}`);
    }
}