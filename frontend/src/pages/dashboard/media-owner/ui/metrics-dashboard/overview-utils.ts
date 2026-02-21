import { ReservationStatus } from "@/entities/reservation";
import type {
    DateRangeMap,
    OverviewMetricsData,
    OverviewPeriod,
    ReservationResponseDTO,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";
import type { MediaLocation } from "@/entities/media-location/model/mediaLocation";
import {
    getReservationAmount,
    normalizeText,
    parseDateMs,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/shared-utils";

export const mediaLegendColors = [
    "blue.6",
    "cyan.6",
    "teal.6",
    "grape.6",
    "indigo.6",
    "lime.6",
    "orange.6",
];

const isOverlappingRange = (
    startMs: number,
    endMs: number,
    rangeStartMs: number,
    rangeEndMs: number
) => startMs < rangeEndMs && endMs > rangeStartMs;

const isUTCMidnight = (d: Date): boolean =>
    d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;

const getLocalMidnightMs = (dateInput: Date | string | number | null): number => {
    if (!dateInput) return 0;
    const d = new Date(dateInput);
    if (isUTCMidnight(d)) {
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).getTime();
    }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const getLocalEndOfDayMs = (dateInput: Date | string | number | null): number => {
    if (!dateInput) return 0;
    const d = new Date(dateInput);
    if (isUTCMidnight(d)) {
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999).getTime();
    }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
};

export const resolveDateRange = (
    period: OverviewPeriod,
    customRange?: DateRangeMap
): [number, number] => {
    const nowMs = Date.now();
    const now = new Date();

    if (period === "allTime") {
        return [0, nowMs];
    }
    if (period === "yearly") {
        const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return [start.getTime(), nowMs];
    }
    if (period === "monthly") {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return [start.getTime(), nowMs];
    }
    if (period === "custom") {
        if (!customRange || (!customRange[0] && !customRange[1])) {
            return [0, nowMs];
        }
        const [start, end] = customRange;
        const startMs = start ? getLocalMidnightMs(start) : 0;
        const endMs = end ? getLocalEndOfDayMs(end) : nowMs;
        return [startMs, endMs];
    }

    // Default to weekly
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return [start.getTime(), nowMs];
};

export const buildOverviewMetricsData = (
    reservations: ReservationResponseDTO[],
    mediaLocations: MediaLocation[],
    period: OverviewPeriod,
    dateRange?: DateRangeMap
): OverviewMetricsData => {
    const [startBoundMs, endBoundMs] = resolveDateRange(period, dateRange);

    const confirmedReservations = reservations.filter(
        (reservation) => reservation.status === ReservationStatus.CONFIRMED
    );

    const periodFilteredReservations = confirmedReservations.filter((reservation) => {
        if (period === "allTime") return true;
        const startMs = parseDateMs(reservation.startDate);
        const endMs = parseDateMs(reservation.endDate);
        if (startMs === null || endMs === null) return false;
        return isOverlappingRange(startMs, endMs, startBoundMs, endBoundMs);
    });

    const revenueByMediaMap = new Map<string, { mediaName: string; revenue: number }>();
    periodFilteredReservations.forEach((reservation) => {
        const mediaId = reservation.mediaId;

        let targetLocationName = "Unknown Location";
        for (const loc of mediaLocations) {
            if (loc.mediaList?.some((m) => m.id === mediaId)) {
                targetLocationName = loc.name;
                break;
            }
        }

        const amount = getReservationAmount(reservation);

        const current = revenueByMediaMap.get(targetLocationName) ?? {
            mediaName: targetLocationName,
            revenue: 0,
        };
        current.revenue += amount;
        revenueByMediaMap.set(targetLocationName, current);
    });

    const revenueByMedia = Array.from(revenueByMediaMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .map((item, index) => ({
            mediaName: item.mediaName,
            revenue: item.revenue,
            color: mediaLegendColors[index % mediaLegendColors.length],
        }));

    const revenueByLocationMap = new Map<string, number>();
    periodFilteredReservations.forEach((reservation) => {
        const city = normalizeText(reservation.mediaCity, "Unknown");
        const amount = getReservationAmount(reservation);
        revenueByLocationMap.set(city, (revenueByLocationMap.get(city) ?? 0) + amount);
    });

    const revenueByLocation = Array.from(revenueByLocationMap.entries())
        .map(([city, revenue]) => ({ city, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

    const nowMs = Date.now();
    const activeReservations = confirmedReservations.filter((reservation) => {
        const startMs = parseDateMs(reservation.startDate);
        const endMs = parseDateMs(reservation.endDate);
        if (startMs === null || endMs === null) return false;
        return startMs <= nowMs && endMs >= nowMs;
    });

    const activeCampaignMap = new Map<
        string,
        {
            campaignName: string;
            advertiserName: string;
            amount: number;
            status: "ACTIVE";
        }
    >();

    activeReservations.forEach((reservation) => {
        const campaignId = reservation.campaignId;
        const campaignName = normalizeText(reservation.campaignName, campaignId);
        const advertiserName = normalizeText(
            reservation.advertiserBusinessName,
            normalizeText(reservation.advertiserBusinessId, "Unknown advertiser")
        );
        const amount = getReservationAmount(reservation);

        const current = activeCampaignMap.get(campaignId) ?? {
            campaignName,
            advertiserName,
            amount: 0,
            status: "ACTIVE" as const,
        };
        current.amount += amount;
        activeCampaignMap.set(campaignId, current);
    });

    const activeCampaignDetails = Array.from(activeCampaignMap.values()).sort(
        (a, b) => b.amount - a.amount
    );

    return {
        revenueByMedia,
        revenueByLocation,
        activeCampaignDetails,
        activeCampaignCount: activeCampaignMap.size,
    };
};
