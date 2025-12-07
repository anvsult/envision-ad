export interface MediaRequest {
    title: string;
    mediaOwnerName: string;
    address: string;
    typeOfDisplay: string; 
    loopDuration: number;
    resolution: string;
    aspectRatio: string;
    width: number;
    height: number;
    price: number;
    schedule: ScheduleModel | null;
    status: string;
}

export interface MediaResponse {
    id: string;
    title: string;
    mediaOwnerName: string;
    address: string;
    typeOfDisplay: string;
    loopDuration: number;
    resolution: string;
    aspectRatio: string;
    width: number;
    height: number;
    price: number;
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