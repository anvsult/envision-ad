import type { MediaResponse } from "../types/MediaTypes";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export async function getAllMedia(): Promise<MediaResponse[]> {
  const url = `${API_BASE}/api/v1/media`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || `Failed to fetch media (${res.status})`);
  }
  const data = await res.json();
  // assume backend returns an array compatible with MediaResponse
  return data as MediaResponse[];
}

export async function addMedia(payload: Partial<MediaResponse> | Record<string, any>): Promise<MediaResponse> {
  const url = `${API_BASE}/api/v1/media`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || `Failed to create media (${res.status})`);
  }
  const data = await res.json();
  return data as MediaResponse;
}

export default { getAllMedia, addMedia };
