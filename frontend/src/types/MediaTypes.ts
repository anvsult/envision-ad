export interface MediaDTO {
    id?: string;
    title: string;
    mediaOwnerName: string;
    mediaLocation: MediaLocationDTO;
    resolution: string;
    aspectRatio: string;
    loopDuration: number | null;
    width: number | null;
    height: number | null;
    price: number | null;
    dailyImpressions: number | null;
    schedule: {
        selectedMonths: string[];
        weeklySchedule: {
            dayOfWeek: string;
            isActive: boolean;
            startTime: string | null;
            endTime: string | null;
        }[];
    };
    status: string | null;
    typeOfDisplay: string;
    imageUrl?: string | null;
}

export interface MediaLocationDTO {
    id: string | null;
    name: string;
    description: string;
    country: string;
    province: string;
    street: string;
    city: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
}

export function getJoinedAddress(items: string[]){
    return items.join(", ");
}

export interface MediaRequest {
    title: string;
    mediaOwnerName: string;
    mediaLocation: MediaLocationDTO | null;
    typeOfDisplay: string; 
    loopDuration: number;
    resolution: string;
    aspectRatio: string;
    width: number;
    height: number;
    price: number;
    dailyImpressions: number;
    schedule: ScheduleModel | null;
    status: string;
}

export interface MediaResponse {
    id: string;
    title: string;
    mediaOwnerName: string;
    mediaLocation: MediaLocationDTO | null;
    typeOfDisplay: string;
    loopDuration: number;
    resolution: string;
    aspectRatio: string;
    width: number;
    height: number;
    price: number;
    dailyImpressions: number;
    schedule: ScheduleModel | null;
    status: string;
    imageUrl: string;
}


export interface WeeklyScheduleEntry {
    dayOfWeek: string;
    isActive: boolean;
    startTime: string | null;
    endTime: string | null;
}

export interface ScheduleModel {
    selectedMonths: string[];
    weeklySchedule: WeeklyScheduleEntry[];
}