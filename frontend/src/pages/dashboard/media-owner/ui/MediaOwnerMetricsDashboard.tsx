"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
    Box,
    Badge,
    Grid,
    Group,
    Pagination,
    Paper,
    Select,
    Skeleton,
    Stack,
    Table,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { AreaChart, BarChart } from "@mantine/charts";
import { useMounted } from "@mantine/hooks";
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconChartBar,
    IconCoin,
    IconSpeakerphone,
    IconTrendingUp,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ReservationResponseDTO, ReservationStatus } from "@/entities/reservation";
import { getEmployeeOrganization } from "@/features/organization-management/api";
import { getPaymentsDashboardData, StripeDashboardPayout } from "@/features/payment";
import { getAllReservationByMediaOwnerBusinessId } from "@/features/reservation-management/api";
import {
    ActiveCampaignItem,
    EarningsTrendPoint,
    mediaOwnerMetricsMock,
    MetricsKpi,
    MetricTrend,
    PayoutHistoryRow,
    RevenueByLocationPoint,
    RevenueByMediaItem,
} from "@/pages/dashboard/media-owner/model/mockMetrics";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const kpiIconMap: Record<string, React.ElementType> = {
    weeklyEarnings: IconCoin,
    monthlyEarnings: IconChartBar,
    yearlyEarnings: IconTrendingUp,
    activeCampaigns: IconSpeakerphone,
};

interface ChartTooltipPayload {
    dataKey?: string;
    name: string;
    value: number;
    color: string;
}

interface PayoutAmountPoint {
    amount: number;
    createdAtUnix: number;
}

type OverviewPeriod = "allTime" | "weekly";

interface OverviewMetricsData {
    revenueByMedia: RevenueByMediaItem[];
    revenueByLocation: RevenueByLocationPoint[];
    activeCampaignDetails: ActiveCampaignItem[];
    activeCampaignCount: number;
}

const mediaLegendColors = [
    "blue.6",
    "cyan.6",
    "teal.6",
    "grape.6",
    "indigo.6",
    "lime.6",
    "orange.6",
];

const parseNumericValue = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const parseDateMs = (value: string | undefined) => {
    if (!value) return null;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : null;
};

const normalizeText = (value: string | undefined, fallback: string) => {
    if (!value) return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
};

const isOverlappingRange = (
    startMs: number,
    endMs: number,
    rangeStartMs: number,
    rangeEndMs: number
) => startMs < rangeEndMs && endMs > rangeStartMs;

const getReservationAmount = (reservation: ReservationResponseDTO) => {
    if (typeof reservation.totalPrice === "number" && Number.isFinite(reservation.totalPrice)) {
        return reservation.totalPrice;
    }
    const numericValue = Number(reservation.totalPrice);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const buildOverviewMetricsData = (
    reservations: ReservationResponseDTO[],
    period: OverviewPeriod
): OverviewMetricsData => {
    const nowMs = Date.now();
    const weeklyStartMs = nowMs - 7 * 24 * 60 * 60 * 1000;

    const confirmedReservations = reservations.filter(
        (reservation) => reservation.status === ReservationStatus.CONFIRMED
    );

    const periodFilteredReservations = confirmedReservations.filter((reservation) => {
        if (period === "allTime") return true;
        const startMs = parseDateMs(reservation.startDate);
        const endMs = parseDateMs(reservation.endDate);
        if (startMs === null || endMs === null) return false;
        return isOverlappingRange(startMs, endMs, weeklyStartMs, nowMs);
    });

    const revenueByMediaMap = new Map<
        string,
        { mediaName: string; revenue: number }
    >();
    periodFilteredReservations.forEach((reservation) => {
        const mediaId = reservation.mediaId;
        const fallbackMediaName =
            mediaId && mediaId.length >= 8 ? `Media ${mediaId.slice(0, 8)}` : "Unknown Media";
        const mediaName = normalizeText(reservation.mediaTitle, fallbackMediaName);
        const amount = getReservationAmount(reservation);

        const current = revenueByMediaMap.get(mediaId) ?? {
            mediaName,
            revenue: 0,
        };
        current.revenue += amount;
        revenueByMediaMap.set(mediaId, current);
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

const subtractDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() - days);
    return next;
};

const subtractMonths = (date: Date, months: number) => {
    const next = new Date(date);
    next.setMonth(next.getMonth() - months);
    return next;
};

const subtractYears = (date: Date, years: number) => {
    const next = new Date(date);
    next.setFullYear(next.getFullYear() - years);
    return next;
};

const startOfDay = (date: Date) => {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
};

const formatTrendDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

const mapPayoutsToAmountPoints = (
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

const sumAmountInRange = (
    points: PayoutAmountPoint[],
    startUnix: number,
    endUnix: number
) =>
    points.reduce((total, point) => {
        if (point.createdAtUnix >= startUnix && point.createdAtUnix < endUnix) {
            return total + point.amount;
        }
        return total;
    }, 0);

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

const buildEarningsKpis = (
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

const buildWeeklyEarningsTrend = (points: PayoutAmountPoint[]): EarningsTrendPoint[] => {
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

const buildEarningsDashboardData = (
    payouts: StripeDashboardPayout[],
    activeCampaignCount = 0
) => {
    const points = mapPayoutsToAmountPoints(payouts);

    return {
        kpis: buildEarningsKpis(points, activeCampaignCount),
        earningsTrend: buildWeeklyEarningsTrend(points),
    };
};

const applyActiveCampaignCountToKpis = (
    sourceKpis: MetricsKpi[],
    activeCampaignCount: number
) =>
    sourceKpis.map((kpi) =>
        kpi.id === "activeCampaigns" ? { ...kpi, value: activeCampaignCount } : kpi
    );

const mapPayoutsToRows = (payouts: StripeDashboardPayout[]): PayoutHistoryRow[] => {
    const nowUnix = Math.floor(Date.now() / 1000);

    return [...payouts]
        .sort(
            (a, b) =>
                (parseNumericValue(b.created) ?? 0) - (parseNumericValue(a.created) ?? 0)
        )
        .map((payout, index): PayoutHistoryRow => {
            const createdAtUnix = parseNumericValue(payout.created) ?? nowUnix;
            const availableOnUnix = parseNumericValue(payout.availableOn);
            const grossAmountMinor = parseNumericValue(payout.amount);
            const netAmountMinor = parseNumericValue(payout.net);
            const amountMinor = grossAmountMinor ?? netAmountMinor ?? 0;

            const transactionId =
                typeof payout.id === "string" && payout.id.trim().length > 0
                    ? payout.id
                    : `PAY-${(index + 1).toString().padStart(4, "0")}`;

            const date = new Date(createdAtUnix * 1000).toISOString().slice(0, 10);

            return {
                transactionId,
                date,
                amount: amountMinor / 100,
                status:
                    availableOnUnix !== null && availableOnUnix > nowUnix
                        ? "PROCESSING"
                        : "PAID",
            };
        });
};

const getUniqueTooltipItems = (payload: ChartTooltipPayload[]) => {
    const seen = new Set<string>();
    return payload.filter((item) => {
        // Recharts can emit duplicates for the same point (area fill + stroke/dot) with different colors.
        const seriesKey = item.dataKey ?? item.name;
        const key = `${seriesKey}-${item.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

function KpiCard({ item }: { item: MetricsKpi }) {
    const t = useTranslations("mediaOwnerMetrics");
    const Icon = kpiIconMap[item.id] ?? IconChartBar;
    const isUp = item.trend === "up";
    const diffColor = isUp ? "teal.6" : "red.6";
    const comparisonTextKey = isUp
        ? "cards.increaseComparedToLastPeriod"
        : "cards.decreaseComparedToLastPeriod";

    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="xs">
                <Text c="dimmed" size="xs" fw={700} tt="uppercase">
                    {t(`cards.${item.id}`)}
                </Text>
                <ThemeIcon variant="light" color="gray" radius="xl" size="md">
                    <Icon size={14} />
                </ThemeIcon>
            </Group>

            <Group align="baseline" gap="xs" mb={2}>
                <Text fw={700} size="xl">
                    {item.id === "activeCampaigns"
                        ? item.value.toString()
                        : formatCurrency(item.value)}
                </Text>
                <Group gap={4}>
                    {isUp ? (
                        <IconArrowUpRight size={14} color="var(--mantine-color-teal-6)" />
                    ) : (
                        <IconArrowDownRight size={14} color="var(--mantine-color-red-6)" />
                    )}
                    <Text fw={600} size="xs" c={diffColor}>
                        {item.deltaPercent > 0 ? `${item.deltaPercent}%` : "--"}
                    </Text>
                </Group>
            </Group>

            <Text size="xs" c="dimmed">
                {t(comparisonTextKey)}
            </Text>
        </Paper>
    );
}

export default function MediaOwnerMetricsDashboard() {
    const t = useTranslations("mediaOwnerMetrics");
    const mounted = useMounted();
    const { user } = useUser();
    const payoutsPerPage = 10;
    const [overviewPeriod, setOverviewPeriod] = useState<OverviewPeriod>("allTime");
    const [mediaOwnerReservations, setMediaOwnerReservations] = useState<
        ReservationResponseDTO[]
    >([]);
    const overviewMetricsData = useMemo(
        () => buildOverviewMetricsData(mediaOwnerReservations, overviewPeriod),
        [mediaOwnerReservations, overviewPeriod]
    );

    const [earningsKpis, setEarningsKpis] = useState<MetricsKpi[]>(() =>
        buildEarningsKpis([], 0)
    );
    const [earningsTrend, setEarningsTrend] = useState<EarningsTrendPoint[]>(() =>
        buildWeeklyEarningsTrend([])
    );
    const [payoutHistoryRows, setPayoutHistoryRows] = useState<PayoutHistoryRow[]>(
        mediaOwnerMetricsMock.payoutHistory
    );
    const [payoutPage, setPayoutPage] = useState(1);

    const totalPayoutPages = Math.max(
        1,
        Math.ceil(payoutHistoryRows.length / payoutsPerPage)
    );
    const currentPayoutPage = Math.min(payoutPage, totalPayoutPages);
    const paginatedPayoutRows = payoutHistoryRows.slice(
        (currentPayoutPage - 1) * payoutsPerPage,
        currentPayoutPage * payoutsPerPage
    );
    const kpis = useMemo(
        () =>
            applyActiveCampaignCountToKpis(
                earningsKpis,
                overviewMetricsData.activeCampaignCount
            ),
        [earningsKpis, overviewMetricsData.activeCampaignCount]
    );

    useEffect(() => {
        if (!user?.sub) return;

        let isCancelled = false;

        const fetchPayouts = async () => {
            try {
                const organization = await getEmployeeOrganization(user.sub);
                if (!organization?.businessId) return;
                const [dashboardDataResult, reservationsResult] =
                    await Promise.allSettled([
                        getPaymentsDashboardData(organization.businessId, "monthly"),
                        getAllReservationByMediaOwnerBusinessId(organization.businessId),
                    ]);

                if (isCancelled) return;

                if (dashboardDataResult.status === "fulfilled") {
                    const payouts = Array.isArray(dashboardDataResult.value.payouts)
                        ? dashboardDataResult.value.payouts
                        : [];
                    const earningsDashboardData = buildEarningsDashboardData(payouts, 0);
                    setEarningsKpis(earningsDashboardData.kpis);
                    setEarningsTrend(earningsDashboardData.earningsTrend);
                    setPayoutHistoryRows(mapPayoutsToRows(payouts));
                    setPayoutPage(1);
                } else {
                    console.error(
                        "Failed to load payout history",
                        dashboardDataResult.reason
                    );
                    setEarningsKpis(buildEarningsKpis([], 0));
                    setEarningsTrend(buildWeeklyEarningsTrend([]));
                    setPayoutHistoryRows(mediaOwnerMetricsMock.payoutHistory);
                    setPayoutPage(1);
                }

                if (reservationsResult.status === "fulfilled") {
                    setMediaOwnerReservations(
                        Array.isArray(reservationsResult.value)
                            ? reservationsResult.value
                            : []
                    );
                } else {
                    console.error(
                        "Failed to load media owner reservations",
                        reservationsResult.reason
                    );
                    setMediaOwnerReservations([]);
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Failed to load media owner metrics", error);
                    setEarningsKpis(buildEarningsKpis([], 0));
                    setEarningsTrend(buildWeeklyEarningsTrend([]));
                    setPayoutHistoryRows(mediaOwnerMetricsMock.payoutHistory);
                    setMediaOwnerReservations([]);
                    setPayoutPage(1);
                }
            }
        };

        void fetchPayouts();

        return () => {
            isCancelled = true;
        };
    }, [user?.sub]);

    const renderAreaTooltip = (
        payload?: ChartTooltipPayload[],
        label?: string | number
    ) => {
        if (!payload || payload.length === 0) return null;
        const labelText = label == null ? "" : String(label);
        const uniquePayload = getUniqueTooltipItems(payload);
        const item = uniquePayload[0];
        if (!item) return null;

        return (
            <Paper px="md" py="xs" withBorder shadow="md" radius="md">
                <Text fw={500} mb={5}>
                    {labelText}
                </Text>
                <Group gap="xs" justify="space-between">
                    <Group gap={5}>
                        <ThemeIcon color={item.color} variant="filled" size={8} radius="xl" />
                        <Text size="sm" c="dimmed">
                            {t("sections.earningsTrendWeekly")}
                        </Text>
                    </Group>
                    <Text size="sm" fw={500}>
                        {formatCurrency(item.value)}
                    </Text>
                </Group>
            </Paper>
        );
    };

    const renderBarTooltip = (
        payload?: ChartTooltipPayload[],
        label?: string | number
    ) => {
        if (!payload || payload.length === 0) return null;
        const labelText = label == null ? "" : String(label);
        const uniquePayload = getUniqueTooltipItems(payload);
        const item = uniquePayload[0];
        if (!item) return null;

        return (
            <Paper px="md" py="xs" withBorder shadow="md" radius="md">
                <Text fw={500} mb={5}>
                    {labelText}
                </Text>
                <Group gap="xs" justify="space-between">
                    <Group gap={5}>
                        <ThemeIcon color={item.color} variant="filled" size={8} radius="xl" />
                        <Text size="sm" c="dimmed">
                            {t("sections.revenueByLocation")}
                        </Text>
                    </Group>
                    <Text size="sm" fw={500}>
                        {formatCurrency(item.value)}
                    </Text>
                </Group>
            </Paper>
        );
    };

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between" align="center">
                <Title order={2}>{t("title")}</Title>
                <Select
                    value={overviewPeriod}
                    onChange={(value) =>
                        setOverviewPeriod((value as OverviewPeriod) ?? "allTime")
                    }
                    data={[
                        { value: "allTime", label: t("period.allTime") },
                        { value: "weekly", label: t("period.weekly") },
                    ]}
                    allowDeselect={false}
                    w={140}
                />
            </Group>

            <Grid gutter="md">
                {kpis.map((kpi) => (
                    <Grid.Col key={kpi.id} span={{ base: 12, sm: 6, lg: 3 }}>
                        <KpiCard item={kpi} />
                    </Grid.Col>
                ))}
            </Grid>

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Paper withBorder p="md" radius="md">
                        <Text fw={600} mb="sm">
                            {t("sections.earningsTrendWeekly")}
                        </Text>
                        <Box w="100%" h={280} style={{ minWidth: 0 }}>
                            {mounted ? (
                                <AreaChart
                                    h={260}
                                    data={earningsTrend}
                                    dataKey="date"
                                    series={[{ name: "earnings", color: "teal.6" }]}
                                    withLegend={false}
                                    withDots
                                    curveType="monotone"
                                    gridAxis="xy"
                                    tickLine="xy"
                                    tooltipProps={{
                                        content: ({ payload, label }) =>
                                            renderAreaTooltip(payload as ChartTooltipPayload[] | undefined, label),
                                    }}
                                />
                            ) : (
                                <Skeleton h={260} radius="md" />
                            )}
                        </Box>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Paper withBorder p="md" radius="md">
                        <Text fw={600} mb="sm">
                            {t("sections.revenueByLocation")}
                        </Text>
                        {overviewMetricsData.revenueByLocation.length === 0 ? (
                            <Text size="sm" c="dimmed">
                                {t("emptyState.noData")}
                            </Text>
                        ) : (
                            <Box w="100%" h={280} style={{ minWidth: 0 }}>
                                {mounted ? (
                                    <BarChart
                                        h={260}
                                        data={overviewMetricsData.revenueByLocation}
                                        dataKey="city"
                                        series={[{ name: "revenue", color: "blue.6" }]}
                                        withLegend={false}
                                        tickLine="xy"
                                        gridAxis="y"
                                        tooltipProps={{
                                            cursor: false,
                                            content: ({ payload, label }) =>
                                                renderBarTooltip(payload as ChartTooltipPayload[] | undefined, label),
                                        }}
                                    />
                                ) : (
                                    <Skeleton h={260} radius="md" />
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Paper withBorder p="md" radius="md">
                        <Text fw={600} mb="sm">
                            {t("sections.revenueByMedia")}
                        </Text>
                        {overviewMetricsData.revenueByMedia.length === 0 ? (
                            <Text size="sm" c="dimmed">
                                {t("emptyState.noData")}
                            </Text>
                        ) : (
                            <Stack gap="md">
                                {overviewMetricsData.revenueByMedia.map((item) => (
                                    <Group justify="space-between" key={item.mediaName}>
                                        <Group gap="xs">
                                            <ThemeIcon size={10} radius="xl" color={item.color} />
                                            <Text size="sm">{item.mediaName}</Text>
                                        </Group>
                                        <Text fw={600} size="sm">
                                            {formatCurrency(item.revenue)}
                                        </Text>
                                    </Group>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Paper withBorder p="md" radius="md">
                        <Text fw={600} mb="sm">
                            {t("sections.activeCampaignDetails")}
                        </Text>
                        {overviewMetricsData.activeCampaignDetails.length === 0 ? (
                            <Text size="sm" c="dimmed">
                                {t("emptyState.noData")}
                            </Text>
                        ) : (
                            <Stack gap="md">
                                {overviewMetricsData.activeCampaignDetails.map((campaign, index) => (
                                    <Group
                                        key={`${campaign.campaignName}-${campaign.advertiserName}-${index}`}
                                        justify="space-between"
                                        align="center"
                                    >
                                        <Stack gap={0}>
                                            <Text size="sm" fw={500}>
                                                {campaign.campaignName}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {campaign.advertiserName}
                                            </Text>
                                        </Stack>
                                        <Stack gap={4} align="flex-end">
                                            <Text fw={600} size="sm">
                                                {formatCurrency(campaign.amount)}
                                            </Text>
                                            <Badge color="teal" variant="light" radius="sm" size="xs">
                                                {t(`campaignStatus.${campaign.status.toLowerCase()}`)}
                                            </Badge>
                                        </Stack>
                                    </Group>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>

            <Paper withBorder p="md" radius="md">
                <Text fw={600} mb="sm">
                    {t("sections.payoutHistory")}
                </Text>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{t("table.transactionId")}</Table.Th>
                            <Table.Th>{t("table.date")}</Table.Th>
                            <Table.Th>{t("table.amount")}</Table.Th>
                            <Table.Th>{t("table.status")}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {paginatedPayoutRows.map((row) => (
                            <Table.Tr key={row.transactionId}>
                                <Table.Td>{row.transactionId}</Table.Td>
                                <Table.Td>{row.date}</Table.Td>
                                <Table.Td>{formatCurrency(row.amount)}</Table.Td>
                                <Table.Td>
                                    <Badge
                                        size="sm"
                                        radius="sm"
                                        variant="light"
                                        color={row.status === "PAID" ? "teal" : "yellow"}
                                    >
                                        {t(`payoutStatus.${row.status.toLowerCase()}`)}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                {totalPayoutPages > 1 && (
                    <Group justify="flex-end" mt="md">
                        <Pagination
                            value={currentPayoutPage}
                            onChange={setPayoutPage}
                            total={totalPayoutPages}
                            withEdges
                        />
                    </Group>
                )}
            </Paper>
        </Stack>
    );
}
