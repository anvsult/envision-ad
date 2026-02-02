"use client";

import React, { useEffect, useState } from "react";
import { Stack, Title, Group, Text, SegmentedControl } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTranslations } from "next-intl";
import {
    ReservationResponseDTO,
    ReservationStatus,
} from "@/entities/reservation";
import { getAllReservationByAdvertiserBusinessId } from "@/features/reservation-management/api";
import { getEmployeeOrganization } from "@/features/organization-management/api";
import { AdvertiserReservationCards } from "@/pages/dashboard/advertiser/ui/cards/AdvertiserReservationCards";
import { PaymentModal } from "@/pages/dashboard/advertiser/ui/modals/PaymentModal";

export default function Advertisements() {
    const t = useTranslations("advertiserReservations");
    const { user } = useUser();

    const [reservations, setReservations] = useState<ReservationResponseDTO[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("approved");

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] =
        useState<ReservationResponseDTO | null>(null);

    useEffect(() => {
        if (!user) return;

        const loadReservations = async () => {
            try {
                const business = await getEmployeeOrganization(user.sub);

                if (business == null) {
                    throw new Error("Failed to load business information");
                }

                const data = await getAllReservationByAdvertiserBusinessId(
                    business.businessId
                );

                setReservations(data);
            } catch (error) {
                console.error("Failed to load reservations", error);
                notifications.show({
                    title: t("notifications.loadFailed.title"),
                    message: t("notifications.loadFailed.message"),
                    color: "red",
                });
            }
        };

        loadReservations();
    }, [user, t]);

    const handlePayClick = (reservation: ReservationResponseDTO) => {
        setSelectedReservation(reservation);
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async () => {
        setPaymentModalOpen(false);
        setSelectedReservation(null);

        try {
            if (!user) return;

            const business = await getEmployeeOrganization(user.sub);

            if (business == null) {
                throw new Error("Failed to load business information");
            }

            const data = await getAllReservationByAdvertiserBusinessId(
                business.businessId
            );

            setReservations(data);
            setStatusFilter("confirmed");

            notifications.show({
                title: t("notifications.paymentSuccess.title"),
                message: t("notifications.paymentSuccess.message"),
                color: "green",
            });
        } catch (error) {
            console.error("Failed to reload reservations", error);
        }
    };

    const pendingReservations = reservations.filter(
        (r) => r.status === ReservationStatus.PENDING
    );
    const approvedReservations = reservations.filter(
        (r) => r.status === ReservationStatus.APPROVED
    );
    const deniedReservations = reservations.filter(
        (r) => r.status === ReservationStatus.DENIED
    );
    const confirmedReservations = reservations.filter(
        (r) => r.status === ReservationStatus.CONFIRMED
    );

    const filteredReservations = (() => {
        switch (statusFilter) {
            case "pending":
                return pendingReservations;
            case "approved":
                return approvedReservations;
            case "denied":
                return deniedReservations;
            case "confirmed":
                return confirmedReservations;
            default:
                return [];
        }
    })();

    const showPayButton = statusFilter === "approved";

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between">
                <Title order={2}>{t("page.title")}</Title>
                <Text size="sm" c="dimmed">
                    {reservations.length}{" "}
                    {reservations.length === 1
                        ? t("page.reservationCount.singular")
                        : t("page.reservationCount.plural")}
                </Text>
            </Group>

            <SegmentedControl
                value={statusFilter}
                onChange={setStatusFilter}
                data={[
                    {
                        label: `${t("tabs.pending")} (${pendingReservations.length})`,
                        value: "pending",
                    },
                    {
                        label: `${t("tabs.approved")} (${approvedReservations.length})`,
                        value: "approved",
                    },
                    {
                        label: `${t("tabs.denied")} (${deniedReservations.length})`,
                        value: "denied",
                    },
                    {
                        label: `${t("tabs.confirmed")} (${confirmedReservations.length})`,
                        value: "confirmed",
                    },
                ]}
            />

            <AdvertiserReservationCards
                reservations={filteredReservations}
                onPayClick={handlePayClick}
                showPayButton={showPayButton}
            />

            <PaymentModal
                opened={paymentModalOpen}
                onClose={() => {
                    setPaymentModalOpen(false);
                    setSelectedReservation(null);
                }}
                reservation={selectedReservation}
                onSuccess={handlePaymentSuccess}
            />
        </Stack>
    );
}