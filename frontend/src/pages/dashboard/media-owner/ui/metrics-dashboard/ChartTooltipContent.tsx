"use client";

import React from "react";
import { Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { useLocale } from "next-intl";
import { formatCurrency } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/formatting-utils";
import type { ChartTooltipPayload } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";

interface ChartTooltipContentProps {
    labelText: string;
    seriesLabel: string;
    item: ChartTooltipPayload;
}

export function ChartTooltipContent({
    labelText,
    seriesLabel,
    item,
}: ChartTooltipContentProps) {
    const locale = useLocale();

    return (
        <Paper px="md" py="xs" withBorder shadow="md" radius="md">
            <Text fw={500} mb={5}>
                {labelText}
            </Text>
            <Group gap="xs" justify="space-between">
                <Group gap={5}>
                    <ThemeIcon color={item.color} variant="filled" size={8} radius="xl" />
                    <Text size="sm" c="dimmed">
                        {seriesLabel}
                    </Text>
                </Group>
                <Text size="sm" fw={500}>
                    {formatCurrency(item.value, { locale })}
                </Text>
            </Group>
        </Paper>
    );
}
