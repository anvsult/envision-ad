import type { MetricTrend } from "@/pages/dashboard/media-owner/model/mockMetrics";
import type {
    DateRangeMap,
    EarningsDashboardData,
    EarningsTrendPoint,
    MetricsKpi,
    OverviewPeriod,
    PayoutAmountPoint,
    ReservationResponseDTO,
    StripeDashboardPayout,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";
import type { MediaLocation } from "@/entities/media-location";
import { resolveDateRange } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/overview-utils";
import {
    formatTrendMonth,
    formatTrendDate,
    getReservationAmount,
    parseDateMs,
    parseNumericValue,
    startOfDay,
    subtractDays,
    subtractMonths,
    subtractYears,
    sumAmountInRange,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/shared-utils";
import { ReservationStatus } from "@/entities/reservation";

const toKpiTrend = (
    currentTotal: number,
    previousTotal: number
): { trend: MetricTrend; deltaPercent: number } => {
    if (previousTotal <= 0) {
        return {
            trend: "up",
            deltaPercent: 0,
        };
    }

    const changePercent = ((currentTotal - previousTotal) / previousTotal) * 100;

    return {
        trend: changePercent >= 0 ? "up" : "down",
        deltaPercent: Math.round(Math.abs(changePercent)),
    };
};

export const mapPayoutsToAmountPoints = (
    payouts: StripeDashboardPayout[]
): PayoutAmountPoint[] => {
    const nowUnix = Math.floor(Date.now() / 1000);

    return payouts.map((payout) => {
        const createdAtUnix = parseNumericValue(payout.created) ?? nowUnix;
        const grossAmountMinor = parseNumericValue(payout.amount);
        const netAmountMinor = parseNumericValue(payout.net);
        const amountMinor = grossAmountMinor ?? netAmountMinor ?? 0;

        return {
            createdAtUnix,
            amount: amountMinor / 100,
        };
    });
};

export const buildEarningsKpis = (
    points: PayoutAmountPoint[],
    activeCampaignCount = 0
): MetricsKpi[] => {
    const now = new Date();
    const nowUnix = Math.floor(now.getTime() / 1000);

    const weeklyStartUnix = Math.floor(subtractDays(now, 7).getTime() / 1000);
    const weeklyPreviousStartUnix = Math.floor(subtractDays(now, 14).getTime() / 1000);
    const weeklyTotal = sumAmountInRange(points, weeklyStartUnix, nowUnix);
    const previousWeeklyTotal = sumAmountInRange(
        points,
        weeklyPreviousStartUnix,
        weeklyStartUnix
    );

    const monthlyStartUnix = Math.floor(subtractMonths(now, 1).getTime() / 1000);
    const monthlyPreviousStartUnix = Math.floor(subtractMonths(now, 2).getTime() / 1000);
    const monthlyTotal = sumAmountInRange(points, monthlyStartUnix, nowUnix);
    const previousMonthlyTotal = sumAmountInRange(
        points,
        monthlyPreviousStartUnix,
        monthlyStartUnix
    );

    const yearlyStartUnix = Math.floor(subtractYears(now, 1).getTime() / 1000);
    const yearlyPreviousStartUnix = Math.floor(subtractYears(now, 2).getTime() / 1000);
    const yearlyTotal = sumAmountInRange(points, yearlyStartUnix, nowUnix);
    const previousYearlyTotal = sumAmountInRange(
        points,
        yearlyPreviousStartUnix,
        yearlyStartUnix
    );

    const weeklyTrend = toKpiTrend(weeklyTotal, previousWeeklyTotal);
    const monthlyTrend = toKpiTrend(monthlyTotal, previousMonthlyTotal);
    const yearlyTrend = toKpiTrend(yearlyTotal, previousYearlyTotal);

    const activeCampaignsKpi = {
        id: "activeCampaigns",
        value: activeCampaignCount,
        deltaPercent: 0,
        trend: "up" as MetricTrend,
    };

    return [
        {
            id: "weeklyEarnings",
            value: weeklyTotal,
            deltaPercent: weeklyTrend.deltaPercent,
            trend: weeklyTrend.trend,
        },
        {
            id: "monthlyEarnings",
            value: monthlyTotal,
            deltaPercent: monthlyTrend.deltaPercent,
            trend: monthlyTrend.trend,
        },
        {
            id: "yearlyEarnings",
            value: yearlyTotal,
            deltaPercent: yearlyTrend.deltaPercent,
            trend: yearlyTrend.trend,
        },
        activeCampaignsKpi,
    ];
};

/**
 * Builds a map from mediaId → location name using mediaList on each location.
 */
function buildLocationMap(mediaLocations: MediaLocation[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const loc of mediaLocations) {
        for (const media of loc.mediaList ?? []) {
            if (media.id) {
                map.set(media.id, loc.name);
            }
        }
    }
    return map;
}

/**
 * Given a list of matching reservations and a location map, returns an object
 * with a key per location name containing the summed amounts for that location.
 */
function buildLocationAmounts(
    matching: ReservationResponseDTO[],
    locationMap: Map<string, string>
): Record<string, number> {
    const amounts: Record<string, number> = {};
    for (const r of matching) {
        const locName = locationMap.get(r.mediaId) ?? "Unknown";
        amounts[locName] = (amounts[locName] ?? 0) + getReservationAmount(r);
    }
    return amounts;
}

/**
 * Returns per-location reservation counts keyed as "<locationName>_count".
 * Used to derive a visible count when some locations are hidden by the legend.
 */
function buildLocationCounts(
    matching: ReservationResponseDTO[],
    locationMap: Map<string, string>
): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const r of matching) {
        const locName = locationMap.get(r.mediaId) ?? "Unknown";
        const key = `${locName}_count`;
        counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
}

export const buildWeeklyEarningsTrend = (
    reservations: ReservationResponseDTO[],
    mediaLocations: MediaLocation[] = []
): EarningsTrendPoint[] => {
    const today = startOfDay(new Date());
    const startDay = subtractDays(today, 6);
    const confirmed = reservations.filter((r) => r.status === ReservationStatus.CONFIRMED);
    const locationMap = buildLocationMap(mediaLocations);

    return Array.from({ length: 7 }, (_, index) => {
        const dayStart = new Date(startDay);
        dayStart.setDate(startDay.getDate() + index);

        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const dayStartMs = dayStart.getTime();
        const dayEndMs = dayEnd.getTime();

        const matching = confirmed.filter((r) => {
            const createdMs = parseDateMs(r.createdAt);
            return createdMs !== null && createdMs >= dayStartMs && createdMs < dayEndMs;
        });

        const totalAmount = matching.reduce((sum, r) => sum + getReservationAmount(r), 0);
        const reservationCount = matching.length;
        const averageAmount = reservationCount > 0 ? totalAmount / reservationCount : 0;
        const locationAmounts = buildLocationAmounts(matching, locationMap);
        const locationCounts = buildLocationCounts(matching, locationMap);

        return {
            date: formatTrendDate(dayStart),
            totalAmount,
            reservationCount,
            averageAmount,
            ...locationAmounts,
            ...locationCounts,
        };
    });
};

export const buildAllTimeEarningsTrend = (
    reservations: ReservationResponseDTO[],
    mediaLocations: MediaLocation[] = []
): EarningsTrendPoint[] => {
    const now = new Date();
    const confirmed = reservations.filter((r) => r.status === ReservationStatus.CONFIRMED);
    const locationMap = buildLocationMap(mediaLocations);

    const earliestCreatedMs = confirmed.reduce((min, r) => {
        const ms = parseDateMs(r.createdAt);
        return ms !== null ? Math.min(min, ms) : min;
    }, Number.POSITIVE_INFINITY);

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    if (Number.isFinite(earliestCreatedMs)) {
        const earliest = new Date(earliestCreatedMs);
        start.setFullYear(earliest.getFullYear(), earliest.getMonth(), 1);
    } else {
        start.setMonth(start.getMonth() - 11);
    }

    const monthBuckets: EarningsTrendPoint[] = [];
    const cursor = new Date(start);

    while (
        cursor.getFullYear() < now.getFullYear() ||
        (cursor.getFullYear() === now.getFullYear() &&
            cursor.getMonth() <= now.getMonth())
    ) {
        const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);

        const monthStartMs = monthStart.getTime();
        const monthEndMs = monthEnd.getTime();

        const matching = confirmed.filter((r) => {
            const createdMs = parseDateMs(r.createdAt);
            return createdMs !== null && createdMs >= monthStartMs && createdMs < monthEndMs;
        });

        const totalAmount = matching.reduce((sum, r) => sum + getReservationAmount(r), 0);
        const reservationCount = matching.length;
        const averageAmount = reservationCount > 0 ? totalAmount / reservationCount : 0;
        const locationAmounts = buildLocationAmounts(matching, locationMap);
        const locationCounts = buildLocationCounts(matching, locationMap);

        monthBuckets.push({
            date: formatTrendMonth(monthStart),
            totalAmount,
            reservationCount,
            averageAmount,
            ...locationAmounts,
            ...locationCounts,
        });

        cursor.setMonth(cursor.getMonth() + 1);
    }

    return monthBuckets;
};

export const buildDailyBuckets = (
    reservations: ReservationResponseDTO[],
    startMs: number,
    endMs: number,
    mediaLocations: MediaLocation[] = []
): EarningsTrendPoint[] => {
    const buckets: EarningsTrendPoint[] = [];
    const cursor = new Date(startMs);
    const end = new Date(endMs);
    const confirmed = reservations.filter((r) => r.status === ReservationStatus.CONFIRMED);
    const locationMap = buildLocationMap(mediaLocations);

    while (cursor <= end) {
        const dayStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const dayStartMs = dayStart.getTime();
        const dayEndMs = dayEnd.getTime();

        const matching = confirmed.filter((r) => {
            const createdMs = parseDateMs(r.createdAt);
            return createdMs !== null && createdMs >= dayStartMs && createdMs < dayEndMs;
        });

        const totalAmount = matching.reduce((sum, r) => sum + getReservationAmount(r), 0);
        const reservationCount = matching.length;
        const averageAmount = reservationCount > 0 ? totalAmount / reservationCount : 0;
        const locationAmounts = buildLocationAmounts(matching, locationMap);
        const locationCounts = buildLocationCounts(matching, locationMap);

        buckets.push({
            date: formatTrendDate(dayStart),
            totalAmount,
            reservationCount,
            averageAmount,
            ...locationAmounts,
            ...locationCounts,
        });

        cursor.setDate(cursor.getDate() + 1);
    }
    return buckets;
};

export const buildMonthlyBuckets = (
    reservations: ReservationResponseDTO[],
    startMs: number,
    endMs: number,
    mediaLocations: MediaLocation[] = []
): EarningsTrendPoint[] => {
    const buckets: EarningsTrendPoint[] = [];
    const confirmed = reservations.filter((r) => r.status === ReservationStatus.CONFIRMED);
    const locationMap = buildLocationMap(mediaLocations);

    let resolvedStartMs = startMs;
    if (startMs === 0) {
        const earliestCreatedMs = confirmed.reduce((min, r) => {
            const ms = parseDateMs(r.createdAt);
            return ms !== null ? Math.min(min, ms) : min;
        }, Number.POSITIVE_INFINITY);

        if (Number.isFinite(earliestCreatedMs)) {
            resolvedStartMs = earliestCreatedMs;
        } else {
            const fallback = new Date();
            fallback.setMonth(fallback.getMonth() - 11);
            resolvedStartMs = fallback.getTime();
        }
    }

    const start = new Date(resolvedStartMs);
    start.setDate(1);
    const end = new Date(endMs);
    const cursor = new Date(start);

    while (
        cursor.getFullYear() < end.getFullYear() ||
        (cursor.getFullYear() === end.getFullYear() &&
            cursor.getMonth() <= end.getMonth())
    ) {
        const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);

        const monthStartMs = monthStart.getTime();
        const monthEndMs = monthEnd.getTime();

        const matching = confirmed.filter((r) => {
            const createdMs = parseDateMs(r.createdAt);
            return createdMs !== null && createdMs >= monthStartMs && createdMs < monthEndMs;
        });

        const totalAmount = matching.reduce((sum, r) => sum + getReservationAmount(r), 0);
        const reservationCount = matching.length;
        const averageAmount = reservationCount > 0 ? totalAmount / reservationCount : 0;
        const locationAmounts = buildLocationAmounts(matching, locationMap);
        const locationCounts = buildLocationCounts(matching, locationMap);

        buckets.push({
            date: formatTrendMonth(monthStart),
            totalAmount,
            reservationCount,
            averageAmount,
            ...locationAmounts,
            ...locationCounts,
        });

        cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
};

export const buildEarningsTrendByCreatedAt = (
    reservations: ReservationResponseDTO[],
    period: OverviewPeriod,
    dateRange?: DateRangeMap,
    mediaLocations: MediaLocation[] = []
): EarningsTrendPoint[] => {
    const [startBoundMs, endBoundMs] = resolveDateRange(period, dateRange);

    const DAILY_BUCKET_THRESHOLD_DAYS = 60;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const isShortRange = endBoundMs - startBoundMs <= DAILY_BUCKET_THRESHOLD_DAYS * MS_PER_DAY;

    if (isShortRange) {
        return buildDailyBuckets(reservations, startBoundMs, endBoundMs, mediaLocations);
    }

    return buildMonthlyBuckets(reservations, startBoundMs, endBoundMs, mediaLocations);
};

export const buildEarningsTrend = (
    reservations: ReservationResponseDTO[],
    period: OverviewPeriod,
    mediaLocations: MediaLocation[] = []
): EarningsTrendPoint[] =>
    period === "weekly"
        ? buildWeeklyEarningsTrend(reservations, mediaLocations)
        : buildAllTimeEarningsTrend(reservations, mediaLocations);

export const buildEarningsDashboardData = (
    payouts: StripeDashboardPayout[],
    activeCampaignCount = 0
): EarningsDashboardData => {
    const points = mapPayoutsToAmountPoints(payouts);
    return {
        kpis: buildEarningsKpis(points, activeCampaignCount),
    };
};

export const applyActiveCampaignCountToKpis = (
    sourceKpis: MetricsKpi[],
    activeCampaignCount: number
) =>
    sourceKpis.map((kpi) =>
        kpi.id === "activeCampaigns" ? { ...kpi, value: activeCampaignCount } : kpi
    );
