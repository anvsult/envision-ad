"use client";

import {
  Button,
  Container,
  Stack,
  Text,
  Box,
  Tooltip,
} from "@mantine/core";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getMediaById, SpecialSort } from "@/features/media-management/api";
import { getMediaReservations } from "@/features/reservation-management/api";
import { useTranslations } from "next-intl";
import { Media } from "@/entities/media";
import { ReserveMediaModal } from "@/widgets/Media/Modals/ReserveMediaModal";
import { MediaCardCarouselLoader, MediaCardStackLoader } from "@/widgets/Carousel/CardCarousel";
import { FilteredActiveMediaProps } from "@/entities/media/model/media";
import { LatLngLiteral } from "leaflet";
import { ReservationStatus } from "@/entities/reservation";
import { usePermissions } from "@/app/providers";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useMediaQuery } from "@mantine/hooks";
import { MediaDetails } from "@/widgets/MediaDetails/MediaDetails";

export default function MediaDetailsPage() {
  const t = useTranslations("mediaPage");
  const isMobile = useMediaQuery("(max-width: 575px)");

  const params = useParams();
  const id = params?.id as string | undefined;

  const [media, setMedia] = useState<Media | null>(null); //The media displayed on the page
  const [loading, setLoading] = useState(true); //Whether the media for the current page is loading or not
  const [error, setError] = useState<string | null>(null); //The error message
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [activeAdsCount, setActiveAdsCount] = useState<number>(0);
  const user = useUser();
  const { permissions } = usePermissions();

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

  return (
    <>
      <Container size="lg" py={20} px={isMobile? "sm" :80}>
        <Stack gap="xl">
          <MediaDetails media={media} loading={loading} error={error} activeAdsCount={activeAdsCount} >
            <Tooltip
              label={!user.user ? t("loginRequired") : t("noPermission")}
              disabled={!!user.user && permissions.includes("create:reservation")}
              position="top"
              withArrow
            >
              <Box w="100%">
                <Button
                  radius="xl"
                  fullWidth
                  onClick={() => setReserveModalOpen(true)}
                  disabled={!user.user || !permissions.includes("create:reservation")}
                >
                  {t("reserveButton")}
                </Button>
              </Box>
            </Tooltip>
            <Text size="xs" c="dimmed">
              {t("reserveNote")}
            </Text>
          </MediaDetails>
          <Container w="100%" p="0">
            {
              media && 
              (isMobile ?
              <MediaCardStackLoader id="other-media-by-organization-list" title={t("otherMediaBy") + media.businessName} filteredMediaProps={filteredOrgMediaProps}/>
              :
              <MediaCardCarouselLoader id="other-media-by-organization-list" title={t("otherMediaBy") + media.businessName} filteredMediaProps={filteredOrgMediaProps}/>)
            }
          </Container>
        </Stack>
        
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
