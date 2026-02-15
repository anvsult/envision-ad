import { ReservationStatus } from "@/entities/reservation";
import type {
    OverviewMetricsData,
    OverviewPeriod,
    ReservationResponseDTO,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";
import {
    getReservationAmount,
    normalizeText,
    parseDateMs,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/shared-utils";

const mediaLegendColors = [
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

export const buildOverviewMetricsData = (
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

    const revenueByMediaMap = new Map<string, { mediaName: string; revenue: number }>();
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
