export interface MediaLocation {
    id: string;
    businessId: string;
    name: string;
    country: string;
    province: string;
    city: string;
    street: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    mediaList?: Media[];
}

import { Media } from "@/entities/media";

export interface MediaLocationRequestDTO {
    name: string;
    country: string;
    province: string;
    city: string;
    street: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    businessId?: string;
}
