"use client";

import React, { useEffect, useState } from "react";
import {
    Container,
    Group,
    Button,
    Text,
    Title,
    Stack,
    Card,
    Divider,
    Loader,
    Center,
    SimpleGrid,
    Modal,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import Image from "next/image";
import { Header } from "@/components/Header/Header";
import { BackButton } from "@/components/BackButton";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/i18n/navigation";
import { getMediaById } from "@/services/MediaService";
import { useTranslations } from "next-intl";
import { getJoinedAddress, MediaDTO } from "@/types/MediaTypes";
import { useAdminMedia } from "@/components/Dashboard/Admin/hooks/useAdminMedia";

const monthDefs = [
    { id: "January", key: "january" },
    { id: "February", key: "february" },
    { id: "March", key: "march" },
    { id: "April", key: "april" },
    { id: "May", key: "may" },
    { id: "June", key: "june" },
    { id: "July", key: "july" },
    { id: "August", key: "august" },
    { id: "September", key: "september" },
    { id: "October", key: "october" },
    { id: "November", key: "november" },
    { id: "December", key: "december" },
];

const hourDefs: { dayId: string; dayKey: string; closed: boolean }[] = [
    { dayId: "Monday", dayKey: "monday", closed: false },
    { dayId: "Tuesday", dayKey: "tuesday", closed: false },
    { dayId: "Wednesday", dayKey: "wednesday", closed: false },
    { dayId: "Thursday", dayKey: "thursday", closed: false },
    { dayId: "Friday", dayKey: "friday", closed: false },
    { dayId: "Saturday", dayKey: "saturday", closed: true },
    { dayId: "Sunday", dayKey: "sunday", closed: true },
];

export default function AdminMediaReviewPage() {
    const t = useTranslations("mediaPage");
    const router = useRouter();

    const params = useParams();
    const id = params?.id as string | undefined;

    const { approveMedia, denyMedia } = useAdminMedia();

    const [media, setMedia] = useState<MediaDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] =
        useState<"approve" | "deny" | null>(null);

    const [submitting, setSubmitting] = useState(false);

    const openConfirm = (action: "approve" | "deny") => {
        setConfirmAction(action);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!confirmAction || !id) return;

        // Guard: only allow actions while current page state is pending
        if ((media?.status ?? "PENDING") !== "PENDING") {
            setConfirmOpen(false);
            setConfirmAction(null);
            return;
        }

        try {
            setSubmitting(true);

            if (confirmAction === "approve") {
                await approveMedia(id);
            } else {
                await denyMedia(id);
            }

            setConfirmOpen(false);
            setConfirmAction(null);

            router.push("/dashboard/admin/medias/pending");
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!id) return;

        const loadMedia = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getMediaById(id);
                setMedia(data);
            } catch (err: unknown) {
                const msg =
                    err instanceof Error ? err.message : "Failed to load media details.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        void loadMedia();
    }, [id]);

    if (loading) {
        return (
            <>
                <Header dashboardMode />
                <Container size="lg" py="xl">
                    <Center>
                        <Loader />
                    </Center>
                </Container>
            </>
        );
    }

    if (error || !media) {
        return (
            <>
                <Header dashboardMode />
                <Container size="lg" py="xl">
                    <Stack align="center" gap="sm">
                        <Text fw={600}>{t("errorTitle")}</Text>
                        <Text size="sm" c="dimmed">
                            {error ?? t("errorNotFound")}
                        </Text>
                        <BackButton />
                    </Stack>
                </Container>
            </>
        );
    }
    const isPending = (media.status ?? "PENDING") === "PENDING";

    if (!isPending) {
        return (
            <>
                <Header dashboardMode />
                <Container size="lg" py="xl">
                    <Stack align="center" gap="sm">
                        <Title order={3}>Review not available</Title>

                        <Text c="dimmed" ta="center">
                            This media has already been reviewed (
                            <b>{media.status}</b>). You can’t approve/deny it again.
                        </Text>

                        <BackButton />
                    </Stack>
                </Container>
            </>
        );
    }


    const activeMonths = new Set(media.schedule?.selectedMonths ?? []);

    const isPoster = media.typeOfDisplay === "POSTER";
    const isDigital = media.typeOfDisplay === "DIGITAL";

    const typeLabel = isPoster
        ? t("mediaTypes.POSTER")
        : isDigital
            ? t("mediaTypes.DIGITAL")
            : media.typeOfDisplay || "N/A";

    const loopDurationLabel =
        media.loopDuration != null
            ? t("loopDurationSeconds", { seconds: media.loopDuration })
            : "N/A";

    const widthLabel = media.width != null ? `${media.width}` : "N/A";
    const heightLabel = media.height != null ? `${media.height}` : "N/A";

    const priceLabel =
        media.price != null
            ? t("pricePerWeek", { price: media.price.toFixed(2) })
            : t("priceUnavailable");

    const imageSrc = media.imageUrl || "/sample-screen.jpg";

    return (
        <>
            <Header dashboardMode />

            <Container size="lg" py="xl">
                <Group align="flex-start" justify="space-between" wrap="wrap">
                    {/* Left Column */}
                    <Stack gap="md" style={{ flex: 2, minWidth: 320 }}>
                        <Group gap="xs">
                            <BackButton />
                            <Title order={2}>{media.title}</Title>
                        </Group>

                        <Card p={0} withBorder radius="lg">
                            <div style={{ position: "relative", width: "100%", height: 300 }}>
                                <Image
                                    src={imageSrc}
                                    alt={media.title}
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                        </Card>

                        <Stack gap={4}>
                            <Text fw={600} size="lg">
                                {getJoinedAddress([
                                    media.mediaLocation.street,
                                    media.mediaLocation.city,
                                    media.mediaLocation.province,
                                ])}
                            </Text>
                            <Text size="sm">{media.mediaOwnerName}</Text>
                            <Text size="sm" c="dimmed">
                                {t("currentlyDisplaying", { count: 0 })}
                            </Text>
                        </Stack>

                        <Divider my="md" />

                        <Stack gap="md">
                            <Text fw={600}>{t("detailsTitle")}</Text>

                            {(() => {
                                const rows: [string, string][] = [
                                    [t("details.type"), typeLabel],
                                    [t("details.aspectRatio"), media.aspectRatio || "N/A"],
                                    [t("details.resolution"), media.resolution || "N/A"],
                                    [t("details.width"), widthLabel],
                                    [t("details.height"), heightLabel],
                                ];

                                if (!isPoster) {
                                    rows.push([t("details.loopDuration"), loopDurationLabel]);
                                }

                                rows.push([
                                    t("details.dailyImpressions"),
                                    t("dailyImpressionPerDay", {
                                        count: media.dailyImpressions ?? 0,
                                    }),
                                ]);

                                return rows.map(([label, val]) => (
                                    <Group key={label} justify="space-between">
                                        <Text size="sm" c="dimmed">
                                            {label}:
                                        </Text>
                                        <Text size="sm">{val}</Text>
                                    </Group>
                                ));
                            })()}
                        </Stack>

                        <Divider my="md" />
                    </Stack>

                    {/* Right Column */}
                    <Stack gap="lg" style={{ flex: 1, minWidth: 320 }}>
                        <Group justify="flex-end">
                            <Button
                                variant="outline"
                                radius="xl"
                                p={0}
                                style={{ width: 40, height: 40, borderRadius: "50%" }}
                                type="button"
                            >
                                <IconAlertCircle size={20} />
                            </Button>
                        </Group>

                        {/* Schedule */}
                        <Card withBorder radius="lg" p="lg">
                            <Stack gap="md">
                                <Text fw={600}>{t("scheduleTitle")}</Text>

                                {/* Months */}
                                <Stack gap="xs">
                                    <Text size="sm" fw={500}>
                                        {t("monthsTitle")}
                                    </Text>

                                    <SimpleGrid cols={4} spacing={6} verticalSpacing={6}>
                                        {monthDefs.map((m) => {
                                            const active = activeMonths.has(m.id);
                                            return (
                                                <Button
                                                    key={m.id}
                                                    size="xs"
                                                    px={8}
                                                    variant={active ? "filled" : "outline"}
                                                    color={active ? "blue" : "gray"}
                                                    disabled={!active}
                                                    type="button"
                                                    styles={{
                                                        label: { whiteSpace: "normal", lineHeight: 1.2 },
                                                    }}
                                                >
                                                    {t(`months.${m.key}`)}
                                                </Button>
                                            );
                                        })}
                                    </SimpleGrid>
                                </Stack>

                                {/* Hours */}
                                <Stack gap="xs">
                                    <Text size="sm" fw={500}>
                                        {t("hoursTitle")}
                                    </Text>

                                    {hourDefs.map((h) => {
                                        const closed = h.closed;
                                        const hoursText = closed
                                            ? t("days.closed")
                                            : t("hoursPattern");

                                        return (
                                            <Group key={h.dayId} justify="space-between">
                                                <Text size="sm" c={closed ? "dimmed" : "dark"}>
                                                    {t(`days.${h.dayKey}`)}:
                                                </Text>
                                                <Text size="sm" c={closed ? "dimmed" : "dark"}>
                                                    {hoursText}
                                                </Text>
                                            </Group>
                                        );
                                    })}
                                </Stack>
                            </Stack>
                        </Card>

                        {/* Admin actions */}
                        <Card withBorder radius="lg" shadow="md" p="lg">
                            <Stack align="center">
                                <Text fw={600} size="xl" td="underline">
                                    {priceLabel}
                                </Text>

                                <Button
                                    radius="xl"
                                    fullWidth
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openConfirm("approve");
                                    }}
                                >
                                    Approve
                                </Button>

                                <Button
                                    radius="xl"
                                    fullWidth
                                    color="red"
                                    variant="outline"
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openConfirm("deny");
                                    }}
                                >
                                    Deny
                                </Button>

                                <Text size="xs" c="dimmed">
                                    Admin review mode
                                </Text>
                            </Stack>
                        </Card>
                    </Stack>
                </Group>
            </Container>

            <Modal
                opened={confirmOpen}
                onClose={() => (submitting ? null : setConfirmOpen(false))}
                centered
                title={confirmAction === "approve" ? "Approve this media?" : "Deny this media?"}
            >
                <Text mb="md">
                    {confirmAction === "approve"
                        ? "Are you sure you want to approve this media?"
                        : "Are you sure you want to deny this media?"}
                </Text>

                <Group justify="flex-end">
                    <Button
                        variant="default"
                        type="button"
                        disabled={submitting}
                        onClick={() => setConfirmOpen(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        loading={submitting}
                        color={confirmAction === "approve" ? "blue" : "red"}
                        onClick={handleConfirm}
                    >
                        {confirmAction === "approve" ? "Approve Media" : "Deny Media"}
                    </Button>
                </Group>
            </Modal>
        </>
    );
}
