import { WeeklyScheduleModel } from "@/entities/media";

export default function calculateWeeklyImpressions(dailyImpressions: number, weeklySchedule: WeeklyScheduleModel[]){
    const activeDayCount = weeklySchedule.filter((s) => s.isActive).length;
    
    return(dailyImpressions * activeDayCount);
}