"use client";

import React, { useEffect, useState } from "react";
import {
    Container,
    Stack,
    Group,
    Text,
    Title,
    Card,
    Divider,
    Loader,
    Center,
    Button,
    Modal, Image,
} from "@mantine/core";
import {
    IconCalendar,
    IconCurrencyDollar,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { notifications } from "@mantine/notifications";

import { useRouter } from "next/navigation";
import { BackButton } from "@/widgets/BackButton";
import { ReservationResponseDTO, ReservationStatus } from "@/entities/reservation";
import { AdCampaign } from "@/entities/ad-campaign";
import { Ad } from "@/entities/ad";
import { getReservationById, updateReservationStatus } from "@/features/reservation-management/api";
import { getAdCampaignById } from "@/features/ad-campaign-management/api";

const formatDate = (isoDate: string, locale: string): string => {
    return new Date(isoDate).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const formatDuration = (start: string, end: string, t: ReturnType<typeof useTranslations>): string => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    const weeks = Math.round(days / 7);

    return weeks === 1 ? t("detail.oneWeek") : t("detail.weeks", { count: weeks });
};

function AdCarousel({ ads }: { ads: Ad[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const current = ads[activeIndex];

    const goTo = (i: number) => setActiveIndex(i);
    const prev = () => setActiveIndex((i) => (i === 0 ? ads.length - 1 : i - 1));
    const next = () => setActiveIndex((i) => (i === ads.length - 1 ? 0 : i + 1));

    useEffect(() => {
        if (current.adType !== "IMAGE") return;

        const timer = setTimeout(() => {
            setActiveIndex((i) => (i === ads.length - 1 ? 0 : i + 1));
        }, current.adDurationSeconds * 1000);

        return () => clearTimeout(timer);
    }, [activeIndex, current, ads.length]);

    return (
        <Card withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
            <div style={{
                position: "relative",
                width: "100%",
                maxHeight: "500px",
                height: "500px",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {current.adType === "IMAGE" ? (
                    <Image
                        key={current.adId}
                        src={current.adUrl}
                        alt={current.name}
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <video
                        key={current.adId}
                        src={current.adUrl}
                        autoPlay
                        muted
                        playsInline
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                )}

                {ads.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            aria-label="Previous ad"
                            style={{
                                position: "absolute",
                                left: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.45)",
                                border: "none",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#fff",
                            }}
                        >
                            <IconChevronLeft size={18} />
                        </button>
                        <button
                            onClick={next}
                            aria-label="Next ad"
                            style={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.45)",
                                border: "none",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#fff",
                            }}
                        >
                            <IconChevronRight size={18} />
                        </button>
                    </>
                )}
            </div>

            <div style={{ padding: "10px 16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <Text size="sm" fw={500}>{current.name}</Text>

                {ads.length > 1 && (
                    <Group gap={6} justify="center">
                        {ads.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label={`Go to ad ${i + 1}`}
                                style={{
                                    width: i === activeIndex ? 20 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    border: "none",
                                    background: i === activeIndex ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-3)",
                                    cursor: "pointer",
                                    transition: "width 0.25s ease, background 0.25s ease",
                                    padding: 0,
                                }}
                            />
                        ))}
                    </Group>
                )}
            </div>
        </Card>
    );
}

export default function AdRequestDetailPage() {
    const t = useTranslations("adRequests");
    const router = useRouter();
    const locale = useLocale();
    const params = useParams();
    const reservationId = params?.id as string | undefined;

    const [reservation, setReservation] = useState<ReservationResponseDTO | null>(null);
    const [campaign, setCampaign] = useState<AdCampaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [confirmAction, setConfirmAction] = useState<"approve" | "deny" | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const confirmOpen = confirmAction !== null;
    const openConfirm = (action: "approve" | "deny") => setConfirmAction(action);
    const closeConfirm = () => {
        if (!submitting) setConfirmAction(null);
    };

    useEffect(() => {
        if (!reservationId) return;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getReservationById(reservationId);
                setReservation(data);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Failed to load ad request.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [reservationId]);

    useEffect(() => {
        if (!reservation?.campaignId) return;

        const loadCampaign = async () => {
            try {
                const data = await getAdCampaignById(reservation.campaignId);
                setCampaign(data);
            } catch (err: unknown) {
                console.error("Failed to load campaign details", err);
            }
        };

        void loadCampaign();
    }, [reservation?.campaignId]);

    const handleConfirm = async () => {
        if (!confirmAction || !reservation) return;

        try {
            setSubmitting(true);
            await updateReservationStatus(reservation.mediaId, reservation.reservationId,
                confirmAction === "approve" ? ReservationStatus.APPROVED : ReservationStatus.DENIED
            );

            closeConfirm();
            notifications.show({
                title: confirmAction === "approve"
                    ? t("notifications.approve.success.title")
                    : t("notifications.deny.success.title"),
                message: confirmAction === "approve"
                    ? t("notifications.approve.success.message")
                    : t("notifications.deny.success.message"),
                color: "green",
            });

            router.push(`/${locale}/dashboard/media-owner/ad-requests`);
        } catch (e) {
            console.error(e);
            notifications.show({
                title: t("notifications.updateFailed.title"),
                message: t("notifications.updateFailed.message"),
                color: "red",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container size="lg" py="xl">
                <Center>
                    <Loader />
                </Center>
            </Container>
        );
    }

    if (error || !reservation) {
        return (
            <Container size="lg" py="xl">
                <Stack align="center" gap="sm">
                    <Text fw={600}>{t("detail.errorTitle")}</Text>
                    <Text size="sm" c="dimmed">
                        {error ?? t("detail.errorNotFound")}
                    </Text>
                    <BackButton />
                </Stack>
            </Container>
        );
    }

    const isPending = reservation.status === ReservationStatus.PENDING;

    if (!isPending) {
        return (
            <Container size="lg" py="xl">
                <Stack align="center" gap="sm">
                    <Title order={3}>{t("detail.reviewUnavailable")}</Title>
                    <Text c="dimmed" ta="center">
                        {t("detail.alreadyActioned", { status: reservation.status })}
                    </Text>
                    <BackButton />
                </Stack>
            </Container>
        );
    }

    const duration = formatDuration(reservation.startDate, reservation.endDate, t);

    return (
        <>
            <Container size="lg" py="xl">
                <Group align="center" justify="space-between" wrap="wrap">

                    <Stack gap="md" style={{ flex: 2, minWidth: 320 }}>
                        <Group gap="xs">
                            <BackButton />
                            <Title order={2}>
                                {campaign?.name || reservation.campaignName || "Ad Request"}
                            </Title>
                        </Group>

                        {campaign && campaign.ads.length > 0 && (
                            <AdCarousel ads={campaign.ads} />
                        )}
                    </Stack>

                    <Stack gap="md" style={{ flex: 1, minWidth: 280 }}>
                        <Card withBorder radius="lg" p="lg">
                            <Stack gap="sm">
                                <Group justify="space-between" align="center">
                                    <Group gap="sm" align="center">
                                        <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
                                        <Text size="sm" c="dimmed">{t("detail.startDate")}</Text>
                                    </Group>
                                    <Text size="sm">{formatDate(reservation.startDate, locale)}</Text>
                                </Group>

                                <Group justify="space-between" align="center">
                                    <Group gap="sm" align="center">
                                        <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
                                        <Text size="sm" c="dimmed">{t("detail.endDate")}</Text>
                                    </Group>
                                    <Text size="sm">{formatDate(reservation.endDate, locale)}</Text>
                                </Group>

                                <Group justify="space-between" align="center">
                                    <Group gap="sm" align="center">
                                        <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
                                        <Text size="sm" c="dimmed">{t("detail.duration")}</Text>
                                    </Group>
                                    <Text size="sm">{duration}</Text>
                                </Group>
                            </Stack>
                        </Card>

                        <Card withBorder radius="lg" shadow="md" p="lg">
                            <Stack align="center" gap="md">
                                <Group gap="xs" align="center">
                                    <IconCurrencyDollar size={20} />
                                    <Text fw={600} size="xl">
                                        {reservation.totalPrice.toLocaleString(locale)}
                                    </Text>
                                </Group>
                                <Text size="xs" c="dimmed">{t("detail.totalPrice")}</Text>

                                <Divider w="100%" />

                                <Button
                                    radius="xl"
                                    fullWidth
                                    type="button"
                                    onClick={() => openConfirm("approve")}
                                >
                                    {t("detail.approve")}
                                </Button>

                                <Button
                                    radius="xl"
                                    fullWidth
                                    color="red"
                                    variant="outline"
                                    type="button"
                                    onClick={() => openConfirm("deny")}
                                >
                                    {t("detail.deny")}
                                </Button>
                            </Stack>
                        </Card>
                    </Stack>
                </Group>
            </Container>

            <Modal
                key={confirmAction ?? "closed"}
                opened={confirmOpen}
                onClose={closeConfirm}
                centered
                keepMounted={false}
                title={
                    confirmAction === "approve"
                        ? t("detail.confirmApproveTitle")
                        : t("detail.confirmDenyTitle")
                }
            >
                {!confirmAction ? null : (
                    <>
                        <Text mb="md">
                            {confirmAction === "approve"
                                ? t("detail.confirmApproveText")
                                : t("detail.confirmDenyText")}
                        </Text>

                        <Group justify="flex-end">
                            <Button
                                variant="default"
                                type="button"
                                disabled={submitting}
                                onClick={closeConfirm}
                            >
                                {t("detail.cancel")}
                            </Button>

                            <Button
                                type="button"
                                loading={submitting}
                                color={confirmAction === "approve" ? "blue" : "red"}
                                onClick={handleConfirm}
                            >
                                {confirmAction === "approve"
                                    ? t("detail.confirmApprove")
                                    : t("detail.confirmDeny")}
                            </Button>
                        </Group>
                    </>
                )}
            </Modal>
        </>
    );
}