"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useMemo, useState } from "react";
import { getEmployeeOrganization } from "@/features/organization-management/api";
import { getPaymentsDashboardData } from "@/features/payment";
import { getAllReservationByMediaOwnerBusinessId } from "@/features/reservation-management/api";
import {
    mediaOwnerMetricsMock,
    type EarningsTrendPoint,
    type MetricsKpi,
    type PayoutHistoryRow,
} from "@/pages/dashboard/media-owner/model/mockMetrics";
import type {
    OverviewPeriod,
    ReservationResponseDTO,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";
import {
    applyActiveCampaignCountToKpis,
    buildEarningsTrend,
    buildEarningsDashboardData,
    buildEarningsKpis,
    mapPayoutsToAmountPoints,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/earnings-utils";
import { buildOverviewMetricsData } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/overview-utils";
import { buildPaginationInfo } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/pagination-utils";
import { mapPayoutsToRows } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/payout-utils";

const PAYOUTS_PER_PAGE = 10;
const REVENUE_BY_MEDIA_PER_PAGE = 5;
const ACTIVE_CAMPAIGN_DETAILS_PER_PAGE = 3;

export function useMediaOwnerMetricsData() {
    const { user } = useUser();
    const [overviewPeriod, setOverviewPeriodState] = useState<OverviewPeriod>("allTime");
    const [mediaOwnerReservations, setMediaOwnerReservations] = useState<
        ReservationResponseDTO[]
    >([]);
    const [revenueByMediaPage, setRevenueByMediaPage] = useState(1);
    const [activeCampaignDetailsPage, setActiveCampaignDetailsPage] = useState(1);
    const [earningsKpis, setEarningsKpis] = useState<MetricsKpi[]>(() =>
        buildEarningsKpis([], 0)
    );
    const [payoutAmountPoints, setPayoutAmountPoints] = useState(() => mapPayoutsToAmountPoints([]));
    const [payoutHistoryRows, setPayoutHistoryRows] = useState<PayoutHistoryRow[]>(
        mediaOwnerMetricsMock.payoutHistory
    );
    const [payoutPage, setPayoutPage] = useState(1);

    const overviewMetricsData = useMemo(
        () => buildOverviewMetricsData(mediaOwnerReservations, overviewPeriod),
        [mediaOwnerReservations, overviewPeriod]
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
        () => buildEarningsTrend(payoutAmountPoints, overviewPeriod),
        [payoutAmountPoints, overviewPeriod]
    );

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
                    setPayoutAmountPoints(mapPayoutsToAmountPoints(payouts));
                    setPayoutHistoryRows(mapPayoutsToRows(payouts));
                    setPayoutPage(1);
                } else {
                    console.error(
                        "Failed to load payout history",
                        dashboardDataResult.reason
                    );
                    setEarningsKpis(buildEarningsKpis([], 0));
                    setPayoutAmountPoints(mapPayoutsToAmountPoints([]));
                    setPayoutHistoryRows(mediaOwnerMetricsMock.payoutHistory);
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
            } catch (error) {
                if (!isCancelled) {
                    console.error("Failed to load media owner metrics", error);
                    setEarningsKpis(buildEarningsKpis([], 0));
                    setPayoutAmountPoints(mapPayoutsToAmountPoints([]));
                    setPayoutHistoryRows(mediaOwnerMetricsMock.payoutHistory);
                    setMediaOwnerReservations([]);
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
        setRevenueByMediaPage(1);
        setActiveCampaignDetailsPage(1);
    };

    return {
        overviewPeriod,
        setOverviewPeriod,
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
    };
}
