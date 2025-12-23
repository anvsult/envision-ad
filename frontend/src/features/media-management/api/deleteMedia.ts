
const API_BASE_URL = 'https://api.example.com';

export async function deleteMedia(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete media: ${response.statusText}`);
    }
}