export type MetricTrend = "up" | "down";

export interface MetricsKpi {
    id: string;
    value: number;
    deltaPercent: number;
    trend: MetricTrend;
}

export interface EarningsTrendPoint {
    date: string;
    earnings: number;
}

export interface RevenueByLocationPoint {
    city: string;
    revenue: number;
}

export interface RevenueByMediaItem {
    mediaName: string;
    revenue: number;
    color: string;
}

export interface ActiveCampaignItem {
    campaignName: string;
    advertiserName: string;
    amount: number;
    status: "ACTIVE";
}

export interface PayoutHistoryRow {
    transactionId: string;
    date: string;
    amount: number;
    status: "PAID" | "PROCESSING";
}

export interface MediaOwnerMetricsMock {
    kpis: MetricsKpi[];
    earningsTrend: EarningsTrendPoint[];
    revenueByLocation: RevenueByLocationPoint[];
    revenueByMedia: RevenueByMediaItem[];
    activeCampaigns: ActiveCampaignItem[];
    payoutHistory: PayoutHistoryRow[];
}

export const mediaOwnerMetricsMock: MediaOwnerMetricsMock = {
    kpis: [
        { id: "weeklyEarnings", value: 1420, deltaPercent: 12, trend: "up" },
        { id: "monthlyEarnings", value: 6850, deltaPercent: 5, trend: "down" },
        { id: "yearlyEarnings", value: 84200, deltaPercent: 18, trend: "up" },
        { id: "activeCampaigns", value: 8, deltaPercent: 0, trend: "up" },
    ],
    earningsTrend: [
        { date: "Jan 1", earnings: 120 },
        { date: "Jan 2", earnings: 150 },
        { date: "Jan 3", earnings: 180 },
        { date: "Jan 4", earnings: 220 },
        { date: "Jan 5", earnings: 190 },
        { date: "Jan 6", earnings: 250 },
        { date: "Jan 7", earnings: 320 },
    ],
    revenueByLocation: [
        { city: "New York", revenue: 26000 },
        { city: "Los Angeles", revenue: 18000 },
        { city: "Chicago", revenue: 12000 },
        { city: "Houston", revenue: 9500 },
        { city: "Miami", revenue: 6800 },
    ],
    revenueByMedia: [
        { mediaName: "Digital Billboard A", revenue: 12500, color: "blue.6" },
        { mediaName: "City Center Screen", revenue: 8500, color: "cyan.6" },
        { mediaName: "Mall Entrance", revenue: 4500, color: "teal.6" },
        { mediaName: "Highway Display", revenue: 15600, color: "grape.6" },
    ],
    activeCampaigns: [
        {
            campaignName: "Summer Sale 2025",
            advertiserName: "Brand X",
            amount: 2000,
            status: "ACTIVE",
        },
        {
            campaignName: "New Car Launch",
            advertiserName: "AutoMotive Inc",
            amount: 5500,
            status: "ACTIVE",
        },
        {
            campaignName: "Holiday Special",
            advertiserName: "RetailGiant",
            amount: 3200,
            status: "ACTIVE",
        },
    ],
    payoutHistory: [
        {
            transactionId: "PAY-1001",
            date: "2025-01-15",
            amount: 4500,
            status: "PAID",
        },
        {
            transactionId: "PAY-1002",
            date: "2025-01-01",
            amount: 4200,
            status: "PAID",
        },
        {
            transactionId: "PAY-1003",
            date: "2024-12-15",
            amount: 5100,
            status: "PAID",
        },
        {
            transactionId: "PAY-1004",
            date: "2024-12-01",
            amount: 3900,
            status: "PAID",
        },
        {
            transactionId: "PAY-1005",
            date: "2024-11-15",
            amount: 4800,
            status: "PROCESSING",
        },
    ],
};
