"use client";

import React, { useEffect, useState } from "react";
import {
    Stack,
    Title,
    Group,
    Text,
    Loader,
    Center,
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
import { AdRequestCards } from "@/pages/dashboard/media-owner/ui/components/AdRequestCard";

export default function AdRequests() {
    const t = useTranslations("adRequests");
    const { user } = useUser();

    const [pendingRequests, setPendingRequests] = useState<
        ReservationResponseDTO[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadAdRequests = async () => {
            try {
                setLoading(true);

                const business = await getEmployeeOrganization(user.sub);
                if (business == null){
                    new Error("Failed to load business information");
                }
                const allReservations =
                    await getAllReservationByMediaOwnerBusinessId(
                        business!.businessId
                    );

                const pending = allReservations.filter(
                    (r) => r.status === ReservationStatus.PENDING
                );

                setPendingRequests(pending);
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

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between">
                <Title order={2}>{t("page.title")}</Title>
                {!loading && (
                    <Text size="sm" c="dimmed">
                        {pendingRequests.length}{" "}
                        {pendingRequests.length === 1
                            ? t("page.requestCount.singular")
                            : t("page.requestCount.plural")}
                    </Text>
                )}
            </Group>

            {loading ? (
                <Center py="xl">
                    <Loader />
                </Center>
            ) : (
                <AdRequestCards requests={pendingRequests} />
            )}
        </Stack>
    );
}