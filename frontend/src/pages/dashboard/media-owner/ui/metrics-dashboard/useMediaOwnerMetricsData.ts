"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useMemo, useState } from "react";
import { getEmployeeOrganization } from "@/features/organization-management/api";
import { getAllMediaLocations } from "@/features/media-location-management/api/getAllMediaLocations";
import { getPaymentsDashboardData } from "@/features/payment";
import { getAllReservationByMediaOwnerBusinessId } from "@/features/reservation-management/api";
import type { MediaLocation } from "@/entities/media-location/model/mediaLocation";
import {
    type EarningsTrendPoint,
    type MetricsKpi,
    type PayoutHistoryRow,
} from "@/pages/dashboard/media-owner/model/mockMetrics";
import type {
    DateRangeMap,
    OverviewPeriod,
    ReservationResponseDTO,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";
import {
    applyActiveCampaignCountToKpis,
    buildEarningsTrendByCreatedAt,
    buildEarningsDashboardData,
    buildEarningsKpis,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/earnings-utils";
import { buildOverviewMetricsData } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/overview-utils";
import { buildPaginationInfo } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/pagination-utils";
import { mapPayoutsToRows } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/payout-utils";
import { buildMediaScreensTimelineData } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/reservation-utils";

const PAYOUTS_PER_PAGE = 10;
const REVENUE_BY_MEDIA_PER_PAGE = 5;
const ACTIVE_CAMPAIGN_DETAILS_PER_PAGE = 3;

export function useMediaOwnerMetricsData() {
    const { user } = useUser();
    const [overviewPeriod, setOverviewPeriodState] = useState<OverviewPeriod>("weekly");
    const [dateRange, setDateRangeState] = useState<DateRangeMap>([null, null]);
    const [mediaOwnerReservations, setMediaOwnerReservations] = useState<
        ReservationResponseDTO[]
    >([]);
    const [mediaLocations, setMediaLocations] = useState<MediaLocation[]>([]);
    const [selectedMediaLocationId, setSelectedMediaLocationId] = useState<string | null>(null);
    const [revenueByMediaPage, setRevenueByMediaPage] = useState(1);
    const [activeCampaignDetailsPage, setActiveCampaignDetailsPage] = useState(1);
    const [earningsKpis, setEarningsKpis] = useState<MetricsKpi[]>(() =>
        buildEarningsKpis([], 0)
    );
    const [payoutHistoryRows, setPayoutHistoryRows] = useState<PayoutHistoryRow[]>([]);
    const [payoutPage, setPayoutPage] = useState(1);

    const overviewMetricsData = useMemo(
        () => buildOverviewMetricsData(mediaOwnerReservations, mediaLocations, overviewPeriod, dateRange),
        [mediaOwnerReservations, mediaLocations, overviewPeriod, dateRange]
    );

    const kpis = useMemo(
        () =>
            applyActiveCampaignCountToKpis(
                earningsKpis,
                overviewMetricsData.activeCampaignCount
            ),
        [earningsKpis, overviewMetricsData.activeCampaignCount]
    );

    const earningsTrend = useMemo<EarningsTrendPoint[]>(
        () => buildEarningsTrendByCreatedAt(mediaOwnerReservations, overviewPeriod, dateRange, mediaLocations),
        [mediaOwnerReservations, overviewPeriod, dateRange, mediaLocations]
    );

    const mediaScreensTimelineData = useMemo(() => {
        const location = mediaLocations.find((loc) => loc.id === selectedMediaLocationId);
        return buildMediaScreensTimelineData(
            mediaOwnerReservations,
            location,
            overviewPeriod,
            dateRange
        );
    }, [mediaOwnerReservations, mediaLocations, selectedMediaLocationId, overviewPeriod, dateRange]);

    const payoutPagination = useMemo(
        () =>
            buildPaginationInfo({
                rows: payoutHistoryRows,
                page: payoutPage,
                rowsPerPage: PAYOUTS_PER_PAGE,
            }),
        [payoutHistoryRows, payoutPage]
    );

    const revenueByMediaPagination = useMemo(
        () =>
            buildPaginationInfo({
                rows: overviewMetricsData.revenueByMedia,
                page: revenueByMediaPage,
                rowsPerPage: REVENUE_BY_MEDIA_PER_PAGE,
            }),
        [overviewMetricsData.revenueByMedia, revenueByMediaPage]
    );

    const activeCampaignDetailsPagination = useMemo(
        () =>
            buildPaginationInfo({
                rows: overviewMetricsData.activeCampaignDetails,
                page: activeCampaignDetailsPage,
                rowsPerPage: ACTIVE_CAMPAIGN_DETAILS_PER_PAGE,
            }),
        [overviewMetricsData.activeCampaignDetails, activeCampaignDetailsPage]
    );

    useEffect(() => {
        if (!user?.sub) return;

        let isCancelled = false;

        const fetchMetrics = async () => {
            try {
                const organization = await getEmployeeOrganization(user.sub);
                if (!organization?.businessId) return;

                const [dashboardDataResult, reservationsResult, locationsResult] =
                    await Promise.allSettled([
                        getPaymentsDashboardData(organization.businessId, "monthly"),
                        getAllReservationByMediaOwnerBusinessId(organization.businessId),
                        getAllMediaLocations(organization.businessId)
                    ]);

                if (isCancelled) return;

                if (dashboardDataResult.status === "fulfilled") {
                    const payouts = Array.isArray(dashboardDataResult.value.payouts)
                        ? dashboardDataResult.value.payouts
                        : [];
                    const earningsDashboardData = buildEarningsDashboardData(payouts, 0);
                    setEarningsKpis(earningsDashboardData.kpis);
                    setPayoutHistoryRows(mapPayoutsToRows(payouts));
                    setPayoutPage(1);
                } else {
                    console.error(
                        "Failed to load payout history",
                        dashboardDataResult.reason
                    );
                    setEarningsKpis(buildEarningsKpis([], 0));
                    setPayoutHistoryRows([]);
                    setPayoutPage(1);
                }

                if (reservationsResult.status === "fulfilled") {
                    setMediaOwnerReservations(
                        Array.isArray(reservationsResult.value)
                            ? reservationsResult.value
                            : []
                    );
                    setRevenueByMediaPage(1);
                    setActiveCampaignDetailsPage(1);
                } else {
                    console.error(
                        "Failed to load media owner reservations",
                        reservationsResult.reason
                    );
                    setMediaOwnerReservations([]);
                    setRevenueByMediaPage(1);
                    setActiveCampaignDetailsPage(1);
                }

                if (locationsResult.status === "fulfilled") {
                    const locations = Array.isArray(locationsResult.value) ? locationsResult.value : [];
                    setMediaLocations(locations);
                    if (locations.length > 0) {
                        setSelectedMediaLocationId(locations[0].id);
                    }
                } else {
                    console.error("Failed to load media locations", locationsResult.reason);
                    setMediaLocations([]);
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Failed to load media owner metrics", error);
                    setEarningsKpis(buildEarningsKpis([], 0));
                    setPayoutHistoryRows([]);
                    setMediaOwnerReservations([]);
                    setMediaLocations([]);
                    setRevenueByMediaPage(1);
                    setActiveCampaignDetailsPage(1);
                    setPayoutPage(1);
                }
            }
        };

        void fetchMetrics();

        return () => {
            isCancelled = true;
        };
    }, [user?.sub]);

    const setOverviewPeriod = (period: OverviewPeriod) => {
        setOverviewPeriodState(period);
        setPayoutPage(1);
        setRevenueByMediaPage(1);
        setActiveCampaignDetailsPage(1);
    };

    const setDateRange = (range: DateRangeMap) => {
        setDateRangeState(range);
        setPayoutPage(1);
        setRevenueByMediaPage(1);
        setActiveCampaignDetailsPage(1);
    };

    return {
        overviewPeriod,
        setOverviewPeriod,
        dateRange,
        setDateRange,
        kpis,
        earningsTrend,
        overviewMetricsData,
        payoutHistoryRows: payoutPagination.rows,
        payoutPage: payoutPagination.currentPage,
        payoutTotalPages: payoutPagination.totalPages,
        setPayoutPage,
        revenueByMediaRows: revenueByMediaPagination.rows,
        revenueByMediaPage: revenueByMediaPagination.currentPage,
        revenueByMediaTotalPages: revenueByMediaPagination.totalPages,
        revenueByMediaRowsPerPage: REVENUE_BY_MEDIA_PER_PAGE,
        setRevenueByMediaPage,
        activeCampaignDetailsRows: activeCampaignDetailsPagination.rows,
        activeCampaignDetailsPage: activeCampaignDetailsPagination.currentPage,
        activeCampaignDetailsTotalPages: activeCampaignDetailsPagination.totalPages,
        activeCampaignDetailsRowsPerPage: ACTIVE_CAMPAIGN_DETAILS_PER_PAGE,
        setActiveCampaignDetailsPage,
        selectedMediaLocationId,
        setSelectedMediaLocationId,
        mediaScreensTimelineData,
        mediaLocations,
    };
}
