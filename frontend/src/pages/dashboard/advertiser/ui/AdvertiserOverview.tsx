"use client";

import React, { useState, useEffect } from "react";
import {
    Grid,
    Paper,
    Text,
    Group,
    Stack,
    Select,
    ThemeIcon,
    Title,
    RingProgress,
    Center,
    Box,
    Skeleton,
} from "@mantine/core";
import {
    IconCoin,
    IconSpeakerphone,
    IconEye,
    IconChartBar,
    IconArrowUpRight,
    IconArrowDownRight,
    IconMapPin,
} from "@tabler/icons-react";
import { AreaChart } from "@mantine/charts";
import { useTranslations } from "next-intl";

export function AdvertiserOverview() {
    const t = useTranslations("sideBar.advertiser");
    const [timeRange, setTimeRange] = useState<string | null>("Weekly");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock Data
    const stats = [
        {
            title: t("graphs.totalAdSpend"),
            value: "C$6,700",
            diff: 12,
            period: t("graphs.comparedToLastWeek"),
            icon: IconCoin,
        },
        {
            title: t("graphs.activeCampaigns"),
            value: "3",
            diff: -1, // Negative for demo
            period: t("graphs.comparedToLastWeek"),
            icon: IconSpeakerphone,
        },
        {
            title: t("graphs.estimatedImpressions"),
            value: "1.4M",
            diff: 55,
            period: t("graphs.comparedToLastWeek"),
            icon: IconEye,
        },
        {
            title: t("graphs.averageCPM"),
            value: "C$0.85",
            diff: 0.5,
            period: t("graphs.comparedToLastWeek"),
            icon: IconChartBar,
        },
    ];

    const weeklyData = [
        { date: "Mon", Impressions: 2400, Spend: 1200 },
        { date: "Tue", Impressions: 1398, Spend: 900 },
        { date: "Wed", Impressions: 9800, Spend: 2100 },
        { date: "Thu", Impressions: 3908, Spend: 1400 },
        { date: "Fri", Impressions: 4800, Spend: 1800 },
        { date: "Sat", Impressions: 3800, Spend: 1000 },
        { date: "Sun", Impressions: 4300, Spend: 1500 },
    ];

    const monthlyData = [
        { date: "Week 1", Impressions: 15000, Spend: 5000 },
        { date: "Week 2", Impressions: 18500, Spend: 6200 },
        { date: "Week 3", Impressions: 22000, Spend: 7500 },
        { date: "Week 4", Impressions: 19500, Spend: 6800 },
    ];

    const yearlyData = [
        { date: "Jan", Impressions: 45000, Spend: 15000 },
        { date: "Feb", Impressions: 52000, Spend: 18000 },
        { date: "Mar", Impressions: 48000, Spend: 16500 },
        { date: "Apr", Impressions: 61000, Spend: 21000 },
        { date: "May", Impressions: 58000, Spend: 19500 },
        { date: "Jun", Impressions: 65000, Spend: 23000 },
        { date: "Jul", Impressions: 72000, Spend: 25000 },
        { date: "Aug", Impressions: 68000, Spend: 24000 },
        { date: "Sep", Impressions: 74000, Spend: 26000 },
        { date: "Oct", Impressions: 81000, Spend: 29000 },
        { date: "Nov", Impressions: 86000, Spend: 31000 },
        { date: "Dec", Impressions: 92000, Spend: 35000 },
    ];

    const chartData = timeRange === "Monthly" ? monthlyData : timeRange === "Yearly" ? yearlyData : weeklyData;

    // Helper to render stats cards
    const items = stats.map((stat) => {
        const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;
        const diffColor = stat.diff > 0 ? "teal" : "red";

        return (
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={stat.title}>
                <Paper withBorder p="xl" radius="md" style={{ height: "100%" }}>
                    <Group justify="space-between" wrap="nowrap">
                        <Text size="md" c="blue" fw={700} tt="uppercase">
                            {stat.title}
                        </Text>
                        <ThemeIcon color="blue" variant="light" size={38} radius="md">
                            <stat.icon size="1.8rem" stroke={1.5} />
                        </ThemeIcon>
                    </Group>

                    <Group align="flex-end" gap="xs" mt={25}>
                        <Text className="text-4xl font-bold">{stat.value}</Text>
                        <Text c={diffColor} fw={700} size="sm" className="flex items-center">
                            <span>{stat.diff}%</span>
                            <DiffIcon size="1rem" stroke={1.5} />
                        </Text>
                    </Group>

                    <Text size="xs" c="dimmed" mt={7}>
                        {stat.period}
                    </Text>
                </Paper>
            </Grid.Col>
        );
    });

    return (
        <Stack gap="xl" p="xl">
            <Group justify="space-between" align="center" mb="lg">
                <Title order={2}>Dashboard Overview</Title>
                <Select
                    value={timeRange}
                    onChange={setTimeRange}
                    data={[
                        { value: "Weekly", label: t("timeRanges.weekly") },
                        { value: "Monthly", label: t("timeRanges.monthly") },
                        { value: "Yearly", label: t("timeRanges.yearly") },
                    ]}
                    w={150}
                    allowDeselect={false}
                />
            </Group>

            <Grid gutter="xl">{items}</Grid>

            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper withBorder p="xl" radius="md">
                        <Group justify="space-between" mb="md">
                            <Text size="lg" fw={600}>
                                {t("graphs.campaignPerformance")}
                            </Text>
                            <Group gap="md">
                                <Group gap="xs">
                                    <ThemeIcon variant="filled" color="blue.6" size={10} radius="xl" />
                                    <Text size="sm" fw={600} c="dimmed">
                                        {t("graphs.impressions")}
                                    </Text>
                                </Group>
                                <Group gap="xs">
                                    <ThemeIcon variant="filled" color="cyan.6" size={10} radius="xl" />
                                    <Text size="sm" fw={600} c="dimmed">
                                        {t("graphs.spent")}
                                    </Text>
                                </Group>
                            </Group>
                        </Group>
                        <Box w="100%" h={370} style={{ minWidth: 0 }}>
                            {mounted ? (
                                <AreaChart
                                    h={350}
                                    data={chartData}
                                    dataKey="date"
                                    series={[
                                        { name: "Impressions", label: t("graphs.impressions"), color: "blue.6" },
                                        { name: "Spend", label: t("graphs.spent"), color: "cyan.6" },
                                    ]}
                                    curveType="monotone"
                                    gridAxis="xy"
                                    tickLine="y"
                                    withLegend={false}
                                    withDots={false}
                                    withPointLabels={false}
                                    areaProps={{ label: false }}
                                    tooltipProps={{
                                        content: ({ payload, label }) => {
                                            if (!payload) return null;
                                            return (
                                                <Paper px="md" py="xs" withBorder shadow="md" radius="md">
                                                    <Text fw={500} mb={5}>{label}</Text>
                                                    {payload.map((item: any) => (
                                                        <Group key={item.name} gap="xs" justify="space-between">
                                                            <Group gap={5}>
                                                                <ThemeIcon color={item.color} variant="filled" size={8} radius="xl" />
                                                                <Text size="sm" c="dimmed">{item.name === "Spend" ? t("graphs.spent") : t("graphs.impressions")}</Text>
                                                            </Group>
                                                            <Text size="sm" fw={500}>
                                                                {item.name === "Spend" ? `C$${item.value}` : item.value}
                                                            </Text>
                                                        </Group>
                                                    ))}
                                                </Paper>
                                            );
                                        }
                                    }}
                                />
                            ) : (
                                <Skeleton height={350} radius="md" />
                            )}
                        </Box>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder p="xl" radius="md" h="100%">
                        <Text size="xl" fw={700} mb="lg">
                            {t("graphs.mediaDistribution")}
                        </Text>
                        <Center h={250}>
                            {/* Placeholder for a distribution chart or similar */}
                            <Group align="center" justify="center" gap="xl">
                                <RingProgress
                                    size={200}
                                    thickness={20}
                                    roundCaps
                                    sections={[
                                        { value: 40, color: 'blue' },
                                        { value: 25, color: 'green' },
                                        { value: 15, color: 'grape' },
                                    ]}
                                    label={
                                        <Center>
                                            <IconMapPin size={40} />
                                        </Center>
                                    }
                                />
                                <Stack gap="xs">
                                    <Group gap="xs">
                                        <ThemeIcon variant="filled" color="blue" size={10} radius="xl" />
                                        <Text size="md" fw={700} c="dimmed">{t("graphs.gym")}</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <ThemeIcon variant="filled" color="green" size={10} radius="xl" />
                                        <Text size="md" fw={700} c="dimmed">{t("graphs.barbershop")}</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <ThemeIcon variant="filled" color="grape" size={10} radius="xl" />
                                        <Text size="md" fw={700} c="dimmed">{t("graphs.groceryStore")}</Text>
                                    </Group>
                                </Stack>
                            </Group>
                        </Center>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
