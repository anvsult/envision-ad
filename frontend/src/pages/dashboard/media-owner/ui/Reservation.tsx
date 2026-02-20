"use client";

import React, { useEffect, useState } from "react";
import {
    Stack,
    Title,
    Group,
    Text,
    Loader,
    Center,
    SegmentedControl,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTranslations } from "next-intl";

import {
    ReservationResponseDTO,
    ReservationStatus,
} from "@/entities/reservation";
import { getAllReservationByMediaOwnerBusinessId } from "@/features/reservation-management/api";
import { getEmployeeOrganization } from "@/features/organization-management/api";
import {ReservationCards} from "@/shared/ui";

export default function Reservation() {
    const t = useTranslations("adRequests");
    const { user } = useUser();

    const [reservations, setReservations] = useState<ReservationResponseDTO[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("pending");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadAdRequests = async () => {
            try {
                setLoading(true);

                const business = await getEmployeeOrganization(user.sub);
                if (business == null) {
                    throw new Error("Failed to load business information");
                }
                const allReservations =
                    await getAllReservationByMediaOwnerBusinessId(
                        business.businessId
                    );

                setReservations(allReservations);
            } catch (error) {
                console.error("Failed to load ad requests", error);
                notifications.show({
                    title: t("notifications.loadFailed.title"),
                    message: t("notifications.loadFailed.message"),
                    color: "red",
                });
            } finally {
                setLoading(false);
            }
        };

        loadAdRequests();
    }, [user, t]);

    const pendingRequests = reservations.filter(
        (r) => r.status === ReservationStatus.PENDING
    );
    const confirmedRequests = reservations.filter(
        (r) => r.status === ReservationStatus.CONFIRMED
    );

    const filteredRequests = statusFilter === "pending"
        ? pendingRequests
        : confirmedRequests;

    return (
        <Stack component="main" gap="md" p="md">
            <Group justify="space-between">
                <Title order={1}>{t("page.title")}</Title>
                {!loading && (
                    <Text size="sm" c="dimmed" aria-live="polite">
                        {pendingRequests.length}{" "}
                        {pendingRequests.length === 1
                            ? t("page.requestCount.singular")
                            : t("page.requestCount.plural")}
                    </Text>
                )}
            </Group>
            {!loading && (
                <SegmentedControl
                    aria-label={t("page.tabs.filterLabel")}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    data={[
                        {
                            label: `${t("page.tabs.pending")} (${pendingRequests.length})`,
                            value: "pending",
                        },
                        {
                            label: `${t("page.tabs.confirmed")} (${confirmedRequests.length})`,
                            value: "confirmed",
                        },
                    ]}
                />
            )}

            {loading ? (
                <Center py="xl" role="status" aria-live="polite" aria-label={t("page.loading")}>
                    <Loader/>
                </Center>
            ) : (
                <ReservationCards
                    reservations={filteredRequests}
                    viewType="media-owner"
                />
            )}
        </Stack>
    );
}