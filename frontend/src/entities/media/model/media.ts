import { LatLngBounds, LatLngLiteral } from "leaflet";

export interface Media {
    id?: string;
    title: string;
    mediaOwnerName: string;
    mediaLocation: MediaLocation;
    resolution: string;
    aspectRatio: string;
    loopDuration: number | null;
    width: number | null;
    height: number | null;
    price: number | null;
    dailyImpressions: number | null;
    schedule: MonthlyScheduleModel;
    status: string | null;
    typeOfDisplay: string;
    imageUrl: string;
    previewConfiguration: string;
    businessId: string;
}

export interface MediaRequestDTO {
    title: string;
    mediaOwnerName: string;
    mediaLocationId: string | null;
    typeOfDisplay: string | null;
    loopDuration: number;
    resolution: string;
    aspectRatio: string;
    width: number;
    height: number;
    price: number;
    dailyImpressions: number;
    schedule: MonthlyScheduleModel | null;
    status: string;
    imageUrl: string | null;
    previewConfiguration?: string | null;
    businessId?: string | null;
}

export interface MediaListResponseDTO {
    content: Media[];
    totalElements: number;
    totalPages: number;
    number: number,
    size: number,
    last: boolean;
    first: boolean;
    empty: boolean;
}

export interface MediaLocation {
    id: string | null;
    name: string;
    description: string;
    country: string;
    province: string;
    street: string;
    city: string;
    postalCode: string;
    latitude: number;
    longitude: number;
}

export interface FilteredActiveMediaProps{
    title?: string | null,
    businessId?: string | null,
    minPrice?: number | null,
    maxPrice?: number | null,
    minDailyImpressions?: number | null,
    sort?: string | null,
    latLng?: LatLngLiteral | null,
    bounds?: LatLngBounds | null,
    excludedId?: string | null,
    page?: number,
    size?: number
}

export interface MonthlyScheduleModel {
    selectedMonths: string[];
    weeklySchedule: WeeklyScheduleModel[];
}

export interface WeeklyScheduleModel {
    dayOfWeek: string;
    isActive: boolean;
    startTime: string | null;
    endTime: string | null;
}

export function getJoinedAddress(items: string[]) {
    return items.join(", ");
}

export enum MediaAdStatuses {
    PENDING = "PENDING",
    DISPLAYING = "DISPLAYING",
}

export const MediaAdStatusMap = {
    [MediaAdStatuses.PENDING]: {
        color: "yellow",
        text: "Pending",
    },
    [MediaAdStatuses.DISPLAYING]: {
        color: "blue",
        text: "Displaying",
    },
} as const;

export type MediaStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface UseMediaListProps{
    filteredMediaProps: FilteredActiveMediaProps,
    loadingLocation?: boolean
    setMediaStatus?: React.Dispatch<React.SetStateAction<MediaStatus>>
}