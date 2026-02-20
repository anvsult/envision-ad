"use client";

import React, { useEffect, useState } from "react";
import { Stack, Title, Group, Text, Loader, Center, SegmentedControl } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";
import { ReservationResponseDTO, ReservationStatus } from "@/entities/reservation";
import { getAllReservationByMediaOwnerBusinessId } from "@/features/reservation-management/api";
import { ReservationCards } from "@/shared/ui";
import { useOrganization } from "@/app/providers";

export default function Reservation() {
    const t = useTranslations("adRequests");
    const { organization } = useOrganization();

    const [reservations, setReservations] = useState<ReservationResponseDTO[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("pending");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!organization) return;

        let ignored = false;

        const fetchReservations = async () => {
            try {
                setLoading(true);
                const data = await getAllReservationByMediaOwnerBusinessId(organization.businessId);
                if (!ignored) setReservations(data);
            } catch (error) {
                if (!ignored) {
                    console.error("Failed to load ad requests", error);
                    notifications.show({
                        title: t("notifications.loadFailed.title"),
                        message: t("notifications.loadFailed.message"),
                        color: "red",
                    });
                }
            } finally {
                if (!ignored) setLoading(false);
            }
        };

        void fetchReservations();

        return () => { ignored = true; };
    }, [organization, t]);

    const pendingRequests = reservations.filter((r) => r.status === ReservationStatus.PENDING);
    const confirmedRequests = reservations.filter((r) => r.status === ReservationStatus.CONFIRMED);
    const filteredRequests = statusFilter === "pending" ? pendingRequests : confirmedRequests;

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between">
                <Title order={2}>{t("page.title")}</Title>
                {!loading && (
                    <Text size="sm" c="dimmed">
                        {pendingRequests.length}{" "}
                        {pendingRequests.length === 1 ? t("page.requestCount.singular") : t("page.requestCount.plural")}
                    </Text>
                )}
            </Group>

            {!loading && (
                <SegmentedControl
                    value={statusFilter}
                    onChange={setStatusFilter}
                    data={[
                        { label: `${t("page.tabs.pending")} (${pendingRequests.length})`, value: "pending" },
                        { label: `${t("page.tabs.confirmed")} (${confirmedRequests.length})`, value: "confirmed" },
                    ]}
                />
            )}

            {loading ? (
                <Center py="xl"><Loader /></Center>
            ) : (
                <ReservationCards reservations={filteredRequests} viewType="media-owner" />
            )}
        </Stack>
    );
}