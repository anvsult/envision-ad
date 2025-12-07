'use client'

import { Container, Group, Pagination, Stack } from '@mantine/core';
import { Header } from "@/components/Header/Header";
import '@mantine/carousel/styles.css';
import { MediaCardGrid } from '@/components/Grid/CardGrid';
import BrowseActions from '@/components/BrowseActions/BrowseActions';
import { useEffect, useMemo, useState } from 'react';
import {  getAllMedia} from "@/services/MediaService";
import { MediaCardProps } from '@/components/Cards/MediaCard';




function BrowsePage() {
  const [media, setMedia] = useState<MediaCardProps[]>([]);

  useEffect(() => {
    getAllMedia()
      .then((data) => {
        const items = (data || []).filter((m) => m.id != null);
        const mapped = items.map((m) => ({
          id: String(m.id),
          title: m.title,
          mediaOwnerName: m.mediaOwnerName,
          address: m.address,
          resolution: m.resolution,
          aspectRatio: m.aspectRatio,
          loopDuration: m.loopDuration,
          width: m.width ?? 0,
          height: m.height ?? 0,
          price: m.price ?? 0,
          typeOfDisplay: m.typeOfDisplay,
          imageUrl: m.imageUrl ?? null,
        }));
        setMedia(mapped);
      })
      .catch((err) => {
        console.error("Failed to load media:", err);
      });
  }, []);

 const ITEMS_PER_PAGE = 4;
  const [activePage, setActivePage] = useState(1);

  const totalPages = Math.ceil(media.length / ITEMS_PER_PAGE);

  const paginatedMedia = useMemo(() => {
      const start = (activePage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return media.slice(start, end);
    }, [media, activePage]);

  return (
    <>
      <Header />

      <Container size="xl" py={20} px={80}>
        <Stack gap="sm">
          <BrowseActions />

          <MediaCardGrid medias={paginatedMedia} />

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                total={totalPages}
                value={activePage}
                onChange={setActivePage}
                size="md"
              />
            </Group>
          )}
          
        </Stack>
      </Container>
    </>
  );
}

export default BrowsePage;
