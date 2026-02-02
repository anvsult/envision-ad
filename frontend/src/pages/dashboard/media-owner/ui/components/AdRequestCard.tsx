import React from "react";
import { Grid, Card, Text, Group, Stack } from "@mantine/core";
import { IconCalendar, IconCurrencyDollar } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import {useLocale, useTranslations} from "next-intl";

import { ReservationResponseDTO } from "@/entities/reservation";

interface AdRequestCardsProps {
    requests: ReservationResponseDTO[];
}

const formatDate = (isoDate: string, locale: string): string => {
    return new Date(isoDate).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export function AdRequestCards({ requests }: AdRequestCardsProps) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("adRequests.page");

    const base = `/${locale}/dashboard/media-owner/ad-requests`;

    if (requests.length === 0) {
        return (
            <Text c="dimmed" ta="center" py="xl" size="sm">
                {t("noRequests")}
            </Text>
        );
    }

    return (
        <Grid>
            {requests.map((request) => (
                <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={request.reservationId}>
                    <Card
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{ cursor: "pointer", height: "100%" }}
                        onClick={() => router.push(`${base}/${request.reservationId}`)}
                    >
                        <Stack gap="sm" style={{ height: "100%" }}>
                            <Group justify="space-between" align="center" wrap="nowrap">
                                <Text fw={600} size="sm" truncate>
                                    {request.campaignName || t("unknownCampaign")}
                                </Text>
                                <Text size="xs" c="yellow.7" fw={500}>
                                    {t("pending")}
                                </Text>
                            </Group>

                            <Group gap="xs" align="center">
                                <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                                <Text size="xs" c="dimmed">
                                    {formatDate(request.startDate, locale)} —{" "}
                                    {formatDate(request.endDate, locale)}
                                </Text>
                            </Group>

                            <Group gap="xs" align="center" style={{ marginTop: "auto" }}>
                                <IconCurrencyDollar size={14} color="var(--mantine-color-dimmed)" />
                                <Text size="sm" fw={500}>
                                    {request.totalPrice.toLocaleString(locale)}
                                </Text>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>
            ))}
        </Grid>
    );
}