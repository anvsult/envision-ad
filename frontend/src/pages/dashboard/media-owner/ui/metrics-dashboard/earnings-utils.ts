import type { MetricTrend } from "@/pages/dashboard/media-owner/model/mockMetrics";
import type {
    EarningsDashboardData,
    EarningsTrendPoint,
    MetricsKpi,
    OverviewPeriod,
    PayoutAmountPoint,
    StripeDashboardPayout,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";
import {
    formatTrendMonth,
    formatTrendDate,
    parseNumericValue,
    startOfDay,
    subtractDays,
    subtractMonths,
    subtractYears,
    sumAmountInRange,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/shared-utils";

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

export const buildWeeklyEarningsTrend = (
    points: PayoutAmountPoint[]
): EarningsTrendPoint[] => {
    const today = startOfDay(new Date());
    const startDay = subtractDays(today, 6);

    return Array.from({ length: 7 }, (_, index) => {
        const dayStart = new Date(startDay);
        dayStart.setDate(startDay.getDate() + index);

        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        return {
            date: formatTrendDate(dayStart),
            earnings: sumAmountInRange(
                points,
                Math.floor(dayStart.getTime() / 1000),
                Math.floor(dayEnd.getTime() / 1000)
            ),
        };
    });
};

export const buildAllTimeEarningsTrend = (
    points: PayoutAmountPoint[]
): EarningsTrendPoint[] => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const earliestPointUnix = points.reduce(
        (min, point) => Math.min(min, point.createdAtUnix),
        Number.POSITIVE_INFINITY
    );

    if (Number.isFinite(earliestPointUnix)) {
        const earliestPointDate = new Date(earliestPointUnix * 1000);
        start.setFullYear(earliestPointDate.getFullYear(), earliestPointDate.getMonth(), 1);
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

        monthBuckets.push({
            date: formatTrendMonth(monthStart),
            earnings: sumAmountInRange(
                points,
                Math.floor(monthStart.getTime() / 1000),
                Math.floor(monthEnd.getTime() / 1000)
            ),
        });

        cursor.setMonth(cursor.getMonth() + 1);
    }

    return monthBuckets;
};

export const buildEarningsTrend = (
    points: PayoutAmountPoint[],
    period: OverviewPeriod
): EarningsTrendPoint[] =>
    period === "weekly"
        ? buildWeeklyEarningsTrend(points)
        : buildAllTimeEarningsTrend(points);

export const buildEarningsDashboardData = (
    payouts: StripeDashboardPayout[],
    activeCampaignCount = 0
): EarningsDashboardData => {
    const points = mapPayoutsToAmountPoints(payouts);
    return {
        kpis: buildEarningsKpis(points, activeCampaignCount),
        earningsTrend: buildWeeklyEarningsTrend(points),
    };
};

export const applyActiveCampaignCountToKpis = (
    sourceKpis: MetricsKpi[],
    activeCampaignCount: number
) =>
    sourceKpis.map((kpi) =>
        kpi.id === "activeCampaigns" ? { ...kpi, value: activeCampaignCount } : kpi
    );
