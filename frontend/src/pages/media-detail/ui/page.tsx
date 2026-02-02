"use client";

import {
  ActionIcon,
  Anchor,
  AspectRatio,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {IconAlertCircle, IconArrowLeft} from "@tabler/icons-react";
import {BackButton} from "@/widgets/BackButton";
import {useParams} from "next/navigation";
import {useEffect, useMemo, useState} from "react";
import {getMediaById, SpecialSort} from "@/features/media-management/api";
import {getMediaReservations} from "@/features/reservation-management/api";
import {useLocale, useTranslations} from "next-intl";
import {getJoinedAddress, Media} from "@/entities/media";
import {ReserveMediaModal} from "@/widgets/Media/Modals/ReserveMediaModal";
import {MediaCardCarouselLoader} from "@/widgets/Carousel/CardCarousel";
import {FilteredActiveMediaProps} from "@/entities/media/model/media";
import {getOrganizationById} from "@/features/organization-management/api";
import {LatLngLiteral} from "leaflet";
import {ReservationStatus} from "@/entities/reservation";

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


export default function MediaDetailsPage() {
  const t = useTranslations("mediaPage");
  const locale = useLocale();

  const params = useParams();
  const id = params?.id as string | undefined;

  const [media, setMedia] = useState<Media | null>(null); //The media displayed on the page
  const [organizationName, setOrganizationName] = useState<string | null>(null) //
  const [loading, setLoading] = useState(true); //Whether the media for the current page is loading or not
  const [error, setError] = useState<string | null>(null); //The error message
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeAdsCount, setActiveAdsCount] = useState<number>(0);

  useEffect(() => {
    if (!id) return;

    const loadMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMediaById(id);
        setMedia(data);

        // Fetch active reservations to count unique campaigns
        try {
          const reservations = await getMediaReservations(id);
          // Count unique campaign IDs from active reservations
          const uniqueCampaigns = new Set(
            reservations
              .filter(r => r.status === ReservationStatus.CONFIRMED)
              .map(r => r.campaignId)
          );
          setActiveAdsCount(uniqueCampaigns.size);
        } catch (err) {
          console.error("Failed to load reservations:", err);
          // Don't fail the whole page if reservations can't be loaded
          setActiveAdsCount(0);
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : t("errorLoading");
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void loadMedia();
  }, [id, t]);

  useEffect(() => {
    if (!media?.businessId) {
      return
    }
    const fetchOrganizationDetails = async (businessId: string) => {
      try {

        const response = await getOrganizationById(businessId);
        setOrganizationName(response.name);
      } catch (e) {
        console.log(e)
      }
    };

    fetchOrganizationDetails(media?.businessId)
  }, [media?.businessId]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const latlng: LatLngLiteral = useMemo(() => ({
    lat: media?.mediaLocation.latitude ?? 0,
    lng: media?.mediaLocation.longitude ?? 0,
  }), [media?.mediaLocation.latitude, media?.mediaLocation.longitude]);

  const filteredOrgMediaProps: FilteredActiveMediaProps = useMemo(() => ({
    sort: SpecialSort.nearest,
    businessId: media?.businessId,
    excludedId: media?.id,
    latlng,
    page: 0,
    size: 10
  }), [latlng, media?.businessId, media?.id]);


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
      ? t("pricePerWeek", { price: formatCurrency(media.price) })
      : t("priceUnavailable");

  const imageSrc = media.imageUrl || "/sample-screen.jpg";

  return (
    <>
      <Container size="md" py={20} px={80}>
        <Stack gap="sm">
          {/* Title Bar */}
          <Group gap="xs" justify="space-between">
            <Group gap="xs">
              <Anchor href={"/browse"}>

                <ActionIcon
                  variant="subtle"
                  radius="xl"
                  size="lg"

                  aria-label="Go back"
                >
                  <IconArrowLeft size={20} />
                </ActionIcon>
              </Anchor>
              <Title order={2}>{media.title}</Title>
            </Group>
            <Button
              variant="outline"
              radius="xl"
              p={0}
              style={{ width: 40, height: 40, borderRadius: "50%" }}
            >
              <IconAlertCircle size={20} />
            </Button>
          </Group>
          {/* Columns */}
          <Group align="stretch" gap="50">
            {/* Left Column */}
            <Stack gap="sm" style={{ flex: 2, minWidth: 320 }}>
              {/* Media Image */}
              <Anchor
                tabIndex={0}
                h="auto"
                w="auto"
                onClick={() => setImageModalOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setImageModalOpen(true);
                  }
                }}
                style={{
                  cursor: "zoom-in",
                  borderRadius: 12,
                  overflow: "hidden",
                }}

              >
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={imageSrc}
                    alt={media.title}
                    fit="cover"
                    radius={0}
                  />
                </AspectRatio>
              </Anchor>
              {/* Address */}
              <Stack gap={4}>
                <Text fw={600} size="lg">
                  {getJoinedAddress([media.mediaLocation.street, media.mediaLocation.city, media.mediaLocation.province])}
                </Text>
                <Text size="sm">{media.mediaOwnerName}</Text>
                <Text size="sm" c="dimmed">
                  {t("currentlyDisplaying", { count: activeAdsCount })}
                </Text>
              </Stack>

              <Divider />

              {/* Media Details */}
              <Stack gap="5" >
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
            </Stack>

            {/* Right Column */}
            <Stack style={{ flex: 1, minWidth: 320 }} align="stretch" justify="flex-start">
              {/* Schedule */}
              <Card withBorder radius="lg" p="lg">
                <Stack gap="md">
                  <Text fw="md">{t("scheduleTitle")}</Text>

                  {/* Months */}
                  <Stack gap="xs">
                    <Text size="sm">
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

                    {media.schedule.weeklySchedule.map((day) => {
                      const isActive = day.isActive;
                      const hoursText =
                        !isActive ? t("days.closed")
                          : ((day.startTime ?? "00:00") + " - " + (day.endTime ?? "00:00"));

                      return (
                        <Group key={day.dayOfWeek} justify="space-between">
                          <Text size="sm" c={!isActive ? "dimmed" : "dark"}>
                            {t(`days.${day.dayOfWeek}`)}:
                          </Text>
                          <Text size="sm" c={!isActive ? "dimmed" : "dark"}>
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
            <MediaCardCarouselLoader id="other-media-by-organization-carousel" title={t("otherMediaBy") + organizationName} filteredMediaProps={filteredOrgMediaProps} />
          </Group>
        </Stack>
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
      </Container>

    </>
  );
}
