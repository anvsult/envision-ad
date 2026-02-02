import React, { useEffect, useState } from "react";
import { Grid, Card, Text, Group, Stack, Button, Badge, Skeleton } from "@mantine/core";
import { IconCalendar, IconCurrencyDollar } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { ReservationResponseDTO, ReservationStatus } from "@/entities/reservation";
import { getMediaById } from "@/features/media-management/api";
import { Media } from "@/entities/media";

interface AdvertiserReservationCardsProps {
    reservations: ReservationResponseDTO[];
    onPayClick: (reservation: ReservationResponseDTO) => void;
    showPayButton: boolean;
}

const formatDate = (isoDate: string): string => {
    return new Date(isoDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getStatusColor = (status: ReservationStatus): string => {
    switch (status) {
        case ReservationStatus.PENDING:
            return "yellow";
        case ReservationStatus.APPROVED:
            return "blue";
        case ReservationStatus.CONFIRMED:
            return "green";
        case ReservationStatus.DENIED:
            return "red";
        default:
            return "gray";
    }
};

const getStatusLabel = (status: ReservationStatus, t: any): string => {
    switch (status) {
        case ReservationStatus.PENDING:
            return t("status.pending");
        case ReservationStatus.APPROVED:
            return t("status.approved");
        case ReservationStatus.CONFIRMED:
            return t("status.confirmed");
        case ReservationStatus.DENIED:
            return t("status.denied");
        default:
            return status;
    }
};

interface ReservationCardProps {
    reservation: ReservationResponseDTO;
    onPayClick: (reservation: ReservationResponseDTO) => void;
    showPayButton: boolean;
    t: any;
}

function ReservationCard({ reservation, onPayClick, showPayButton, t }: ReservationCardProps) {
    const [media, setMedia] = useState<Media | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const mediaData = await getMediaById(reservation.mediaId);
                setMedia(mediaData);
            } catch (error) {
                console.error("Failed to load media:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, [reservation.mediaId]);

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ height: "100%" }}
        >
            <Stack gap="sm" style={{ height: "100%" }}>
                <Group justify="space-between" align="center" wrap="nowrap">
                    {loading ? (
                        <Skeleton height={20} width="60%" />
                    ) : (
                        <Text fw={600} size="sm" truncate>
                            {media?.title || "Unknown Media"}
                        </Text>
                    )}
                    <Badge color={getStatusColor(reservation.status)} variant="light" size="sm">
                        {getStatusLabel(reservation.status, t)}
                    </Badge>
                </Group>

                <Text size="xs" c="dimmed" truncate>
                    {reservation.campaignName || "Unknown Campaign"}
                </Text>

                <Group gap="xs" align="center">
                    <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed">
                        {formatDate(reservation.startDate)} —{" "}
                        {formatDate(reservation.endDate)}
                    </Text>
                </Group>

                <Group gap="xs" align="center">
                    <IconCurrencyDollar size={14} color="var(--mantine-color-dimmed)" />
                    <Text size="sm" fw={500}>
                        {reservation.totalPrice.toLocaleString()}
                    </Text>
                </Group>

                {showPayButton && (
                    <Button
                        fullWidth
                        mt="auto"
                        onClick={() => onPayClick(reservation)}
                    >
                        {t("payButton")}
                    </Button>
                )}
            </Stack>
        </Card>
    );
}

export function AdvertiserReservationCards({
                                               reservations,
                                               onPayClick,
                                               showPayButton,
                                           }: AdvertiserReservationCardsProps) {
    const t = useTranslations("advertiserReservations");

    if (reservations.length === 0) {
        return (
            <Text c="dimmed" ta="center" py="xl" size="sm">
                {t("noReservations")}
            </Text>
        );
    }

    return (
        <Grid>
            {reservations.map((reservation) => (
                <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={reservation.reservationId}>
                    <ReservationCard
                        reservation={reservation}
                        onPayClick={onPayClick}
                        showPayButton={showPayButton}
                        t={t}
                    />
                </Grid.Col>
            ))}
        </Grid>
    );
}