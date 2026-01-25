"use client";

import React, { useState } from "react";
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
} from "@mantine/core";
import {
    IconCoin,
    IconSpeakerphone,
    IconEye,
    IconChartBar,
    IconArrowUpRight,
    IconArrowDownRight,
} from "@tabler/icons-react";
import { AreaChart } from "@mantine/charts";

export function AdvertiserOverview() {
    const [timeRange, setTimeRange] = useState<string | null>("Weekly");

    // Mock Data
    const stats = [
        {
            title: "Total Ad Spend",
            value: "C$6,700",
            diff: 12,
            period: "Compared to last week",
            icon: IconCoin,
        },
        {
            title: "Active Campaigns",
            value: "3",
            diff: -1, // Negative for demo
            period: "Compared to last week",
            icon: IconSpeakerphone,
        },
        {
            title: "Estimated Impressions",
            value: "1.4M",
            diff: 55,
            period: "Compared to last week",
            icon: IconEye,
        },
        {
            title: "Average CPM",
            value: "C$0.85",
            diff: 0.5,
            period: "Compared to last week",
            icon: IconChartBar,
        },
    ];

    const chartData = [
        { date: "Mon", Impressions: 2400, Spend: 1200 },
        { date: "Tue", Impressions: 1398, Spend: 900 },
        { date: "Wed", Impressions: 9800, Spend: 2100 },
        { date: "Thu", Impressions: 3908, Spend: 1400 },
        { date: "Fri", Impressions: 4800, Spend: 1800 },
        { date: "Sat", Impressions: 3800, Spend: 1000 },
        { date: "Sun", Impressions: 4300, Spend: 1500 },
    ];

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
                    data={["Weekly", "Monthly", "Yearly"]}
                    w={150}
                    allowDeselect={false}
                />
            </Group>

            <Grid gutter="xl">{items}</Grid>

            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper withBorder p="xl" radius="md">
                        <Text size="lg" fw={600} mb="lg">
                            Campaign Performance
                        </Text>
                        <AreaChart
                            h={300}
                            data={chartData}
                            dataKey="date"
                            series={[
                                { name: "Impressions", color: "blue.6" },
                                { name: "Spend", color: "cyan.6" },
                            ]}
                            curveType="monotone"
                            gridAxis="xy"
                            tickLine="y"
                            withLegend
                            withPointLabels
                        />
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder p="xl" radius="md" h="100%">
                        <Text size="lg" fw={600} mb="lg">
                            Device Distribution
                        </Text>
                        <Center h={250}>
                            {/* Placeholder for a distribution chart or similar */}
                            <Stack align="center">
                                <RingProgress
                                    size={180}
                                    thickness={16}
                                    roundCaps
                                    sections={[
                                        { value: 40, color: 'blue' },
                                        { value: 25, color: 'cyan' },
                                        { value: 15, color: 'indigo' },
                                    ]}
                                    label={
                                        <Center>
                                            <IconChartBar size={30} />
                                        </Center>
                                    }
                                />
                                <Group gap="xs">
                                    <Text size="xs" c="blue" fw={700}>Mobile</Text>
                                    <Text size="xs" c="cyan" fw={700}>Desktop</Text>
                                    <Text size="xs" c="indigo" fw={700}>Tablet</Text>
                                </Group>
                            </Stack>
                        </Center>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
