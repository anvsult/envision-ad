const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface MediaDTO {
    id?: string;
    title: string;
    mediaOwnerName: string;
    address: string;
    resolution: string;
    aspectRatio: string;
    loopDuration: number | null;
    width: number | null;
    height: number | null;
    price: number | null;
    schedule: {
        selectedMonths: string[];
        days: {
            monday:    { isActive: boolean; startTime: string | null; endTime: string | null };
            tuesday:   { isActive: boolean; startTime: string | null; endTime: string | null };
            wednesday: { isActive: boolean; startTime: string | null; endTime: string | null };
            thursday:  { isActive: boolean; startTime: string | null; endTime: string | null };
            friday:    { isActive: boolean; startTime: string | null; endTime: string | null };
            saturday:  { isActive: boolean; startTime: string | null; endTime: string | null };
            sunday:    { isActive: boolean; startTime: string | null; endTime: string | null };
        };
    };
    status: string | null;
    typeOfDisplay: string;
    imageUrl?: string | null;
}

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

export async function addMedia(media: Omit<MediaDTO, 'id'>): Promise<MediaDTO> {
    const response = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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

export async function updateMedia(id: string, media: Partial<MediaDTO>): Promise<MediaDTO> {
    const response = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
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
