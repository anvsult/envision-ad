"use client";

import React from "react";
import { Box, Grid, Group, Paper, Select, Skeleton, Stack, Text, Title } from "@mantine/core";
import { AreaChart, BarChart } from "@mantine/charts";
import { useMounted } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { ActiveCampaignDetailsSection } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/ActiveCampaignDetailsSection";
import { ChartTooltipContent } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/ChartTooltipContent";
import { KpiCard } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/KpiCard";
import { PayoutHistorySection } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/PayoutHistorySection";
import { RevenueByMediaSection } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/RevenueByMediaSection";
import type {
    ChartTooltipPayload,
    OverviewPeriod,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";
import { getUniqueTooltipItems } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/tooltip-utils";
import { useMediaOwnerMetricsData } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/useMediaOwnerMetricsData";

export default function MediaOwnerMetricsDashboard() {
    const t = useTranslations("mediaOwnerMetrics");
    const mounted = useMounted();
    const {
        overviewPeriod,
        setOverviewPeriod,
        kpis,
        earningsTrend,
        overviewMetricsData,
        payoutHistoryRows,
        payoutPage,
        payoutTotalPages,
        setPayoutPage,
        revenueByMediaRows,
        revenueByMediaPage,
        revenueByMediaTotalPages,
        revenueByMediaRowsPerPage,
        setRevenueByMediaPage,
        activeCampaignDetailsRows,
        activeCampaignDetailsPage,
        activeCampaignDetailsTotalPages,
        activeCampaignDetailsRowsPerPage,
        setActiveCampaignDetailsPage,
    } = useMediaOwnerMetricsData();

    const renderTooltip = (
        payload: ChartTooltipPayload[] | undefined,
        label: string | number | undefined,
        seriesLabel: string
    ) => {
        if (!payload || payload.length === 0) return null;
        const uniquePayload = getUniqueTooltipItems(payload);
        const item = uniquePayload[0];
        if (!item) return null;

        const labelText = label == null ? "" : String(label);
        return (
            <ChartTooltipContent
                labelText={labelText}
                seriesLabel={seriesLabel}
                item={item}
            />
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
                                            renderTooltip(
                                                payload as ChartTooltipPayload[] | undefined,
                                                label,
                                                t("sections.earningsTrendWeekly")
                                            ),
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
                                                renderTooltip(
                                                    payload as ChartTooltipPayload[] | undefined,
                                                    label,
                                                    t("sections.revenueByLocation")
                                                ),
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
                    <RevenueByMediaSection
                        rows={revenueByMediaRows}
                        totalRows={overviewMetricsData.revenueByMedia.length}
                        currentPage={revenueByMediaPage}
                        totalPages={revenueByMediaTotalPages}
                        rowsPerPage={revenueByMediaRowsPerPage}
                        onPageChange={setRevenueByMediaPage}
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <ActiveCampaignDetailsSection
                        rows={activeCampaignDetailsRows}
                        totalRows={overviewMetricsData.activeCampaignDetails.length}
                        currentPage={activeCampaignDetailsPage}
                        totalPages={activeCampaignDetailsTotalPages}
                        rowsPerPage={activeCampaignDetailsRowsPerPage}
                        onPageChange={setActiveCampaignDetailsPage}
                    />
                </Grid.Col>
            </Grid>

            <PayoutHistorySection
                rows={payoutHistoryRows}
                currentPage={payoutPage}
                totalPages={payoutTotalPages}
                onPageChange={setPayoutPage}
            />
        </Stack>
    );
}
