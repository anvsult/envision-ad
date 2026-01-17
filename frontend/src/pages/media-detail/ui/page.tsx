"use client";

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
  Image,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { BackButton } from "@/widgets/BackButton";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getMediaById } from "@/features/media-management/api";
import { useTranslations } from "next-intl";
import { getJoinedAddress, Media } from "@/entities/media";
import { ReserveMediaModal } from "@/widgets/Media/Modals/ReserveMediaModal";

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

export default function MediaDetailsPage() {
  const t = useTranslations("mediaPage");

  const params = useParams();
  const id = params?.id as string | undefined;

  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

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

  // Temp TODO: Replace with real photo when implemened
  const imageSrc = media.imageUrl || "/sample-screen.jpg";

  return (
    <>
      <Container size="lg" py="xl">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          {/* Left Column */}
          <Stack gap="md" style={{ flex: 2, minWidth: 320 }}>
            <Group gap="xs">
              <BackButton />
              <Title order={2}>{media.title}</Title>
            </Group>

            <Card p={0} withBorder radius="lg">
              <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setImageModalOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setImageModalOpen(true);
                    }
                  }}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 300,
                    cursor: "zoom-in",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
              >
                <Image
                    src={imageSrc}
                    alt={media.title}
                    h={300}
                    w="100%"
                    fit="cover"
                    radius={0}
                />
              </div>
            </Card>
            <Stack gap={4}>
              <Text fw={600} size="lg">
                {getJoinedAddress([media.mediaLocation.street, media.mediaLocation.city, media.mediaLocation.province])}
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
                          styles={{
                            label: {
                              whiteSpace: "normal",
                              lineHeight: 1.2,
                            },
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

            <Card withBorder radius="lg" shadow="md" p="lg">
              <Stack align="center">
                <Text fw={600} size="xl" td="underline">
                  {priceLabel}
                </Text>
                <Button radius="xl" fullWidth onClick={() => setReserveModalOpen(true)}>
                  {t("reserveButton")}
                </Button>
                <Text size="xs" c="dimmed">
                  {t("reserveNote")}
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Group>
      </Container>
      <Modal
          opened={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          centered
          withCloseButton
          title={media.title}
          size="auto"
          padding="md"
          overlayProps={{ opacity: 0.6 }}
          styles={{
            content: {
              maxWidth: "92vw",
            },
            body: {
              paddingTop: 8,
            },
          }}
      >
        <Image
            src={imageSrc}
            alt={media.title}
            fit="contain"
            w="auto"
            radius="md"
            styles={{
              root: { maxWidth: "88vw", maxHeight: "80vh" },
            }}
        />
      </Modal>
      {media && (
        <ReserveMediaModal
          opened={reserveModalOpen}
          onClose={() => setReserveModalOpen(false)}
          media={media}
        />
      )}
    </>
  );
}
