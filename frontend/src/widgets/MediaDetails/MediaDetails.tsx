import { getJoinedAddress, Media } from "@/entities/media";
import calculateWeeklyImpressions from "@/features/media-management/api/calculateWeeklyImpressions";
import { Anchor, AspectRatio, Group, Stack, Title, Image, Text, Divider, Card, SimpleGrid, Badge, Container, Center, Loader, Modal } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { BackButton } from "../BackButton";
import { formatCurrency } from "@/shared/lib/formatCurrency";

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

interface MediaDetailsProps{
  media: Media | null;
  loading: boolean;
  error: string | null;
  activeAdsCount: number | null;
  children: React.ReactNode
}

export function MediaDetails({media, loading, error, activeAdsCount, children}: MediaDetailsProps){
  const t = useTranslations("mediaPage");
  const locale = useLocale();
  const [imageModalOpen, setImageModalOpen] = useState(false);

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

  const weeklyImpressions = calculateWeeklyImpressions(media.dailyImpressions ?? 0, media.schedule.weeklySchedule ?? []);

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
        ? t("pricePerWeek", { price: formatCurrency(media.price, { locale }) })
        : t("priceUnavailable");

  const imageSrc = media.imageUrl || "/sample-screen.jpg";

  return(
      <Stack gap="sm">
        {/* Title Bar */}
        <Group gap="md" justify="space-between">
          <Group gap="xs">
            <BackButton />
            <Title order={2}>{media.title}</Title>
          </Group>
        </Group>
        {/* Columns */}
        <Group align="stretch" gap="50px">
          {/* Left Column */}
          <Stack gap="sm" style={{ flex: 2, minWidth: 320, width: 430 }}>
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
              <AspectRatio ratio={1}>
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
              <Text size="sm">{media.businessName}</Text>
              {activeAdsCount !== null && 
                <Text size="sm" c="dimmed">
                  {t("currentlyDisplaying", { count: activeAdsCount })}
                </Text>
              }
              
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
                  t("details.weeklyImpressions"),
                  t("weeklyImpressions", {
                    count: weeklyImpressions,
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
                        <Badge
                          key={m.id}
                          size="lg"
                          p="0"
                          w="100%"
                          variant={active ? "filled" : "light"}
                          color={active ? "blue" : "gray"}
                        >
                          {t(`months.${m.key}`)}
                        </Badge>
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
                
                {children}
              </Stack>
            </Card>
          </Stack>
          
        </Group>
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
      </Stack>
  );
}