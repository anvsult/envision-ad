"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Stack, Title, Group, Text, SegmentedControl } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";
import {
    ReservationResponseDTO,
    ReservationStatus,
} from "@/entities/reservation";
import { getAllReservationByAdvertiserBusinessId } from "@/features/reservation-management/api";
import { PaymentModal } from "@/pages/dashboard/advertiser/ui/modals/PaymentModal";
import { ReservationCards } from "@/shared/ui";
import { useOrganization } from "@/app/providers";

export default function Advertisements() {
    const t = useTranslations("advertiserReservations");
    const { organization } = useOrganization();

    const [reservations, setReservations] = useState<ReservationResponseDTO[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("approved");

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] =
        useState<ReservationResponseDTO | null>(null);

    const loadReservations = useCallback(async () => {
        if (!organization) return;
        try {
            const data = await getAllReservationByAdvertiserBusinessId(
                organization.businessId
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
    }, [organization, t]);

    useEffect(() => {
        if (!organization) return;

        let ignored = false;

        const fetchReservations = async () => {
            try {
                const data = await getAllReservationByAdvertiserBusinessId(
                    organization.businessId
                );
                if (!ignored) setReservations(data);
            } catch (error) {
                if (!ignored) {
                    console.error("Failed to load reservations", error);
                    notifications.show({
                        title: t("notifications.loadFailed.title"),
                        message: t("notifications.loadFailed.message"),
                        color: "red",
                    });
                }
            }
        };

        void fetchReservations();

        return () => { ignored = true; };
    }, [organization, t]);

    const handlePayClick = (reservation: ReservationResponseDTO) => {
        setSelectedReservation(reservation);
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async () => {
        setPaymentModalOpen(false);
        setSelectedReservation(null);

        await loadReservations();

        notifications.show({
            title: t("notifications.paymentSuccess.title"),
            message: t("notifications.paymentSuccess.message"),
            color: "green",
        });
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
            case "pending": return pendingReservations;
            case "approved": return approvedReservations;
            case "denied": return deniedReservations;
            case "confirmed": return confirmedReservations;
            default: return [];
        }
    })();

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
                    { label: `${t("tabs.pending")} (${pendingReservations.length})`, value: "pending" },
                    { label: `${t("tabs.approved")} (${approvedReservations.length})`, value: "approved" },
                    { label: `${t("tabs.denied")} (${deniedReservations.length})`, value: "denied" },
                    { label: `${t("tabs.confirmed")} (${confirmedReservations.length})`, value: "confirmed" },
                ]}
            />

            <ReservationCards
                reservations={filteredReservations}
                viewType="advertiser"
                onPayClick={handlePayClick}
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