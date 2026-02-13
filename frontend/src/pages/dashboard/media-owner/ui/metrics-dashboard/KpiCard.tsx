"use client";

import React from "react";
import { Group, Paper, Text, ThemeIcon } from "@mantine/core";
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconChartBar,
    IconCoin,
    IconSpeakerphone,
    IconTrendingUp,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { MetricsKpi } from "@/pages/dashboard/media-owner/model/mockMetrics";
import { formatCurrency } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/formatting-utils";

const kpiIconMap: Record<string, React.ElementType> = {
    weeklyEarnings: IconCoin,
    monthlyEarnings: IconChartBar,
    yearlyEarnings: IconTrendingUp,
    activeCampaigns: IconSpeakerphone,
};

export function KpiCard({ item }: { item: MetricsKpi }) {
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
