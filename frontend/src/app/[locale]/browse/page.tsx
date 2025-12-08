'use client'

import { ActionIcon, Container, Group, Pagination, Stack, Text, TextInput } from '@mantine/core';
import { Header } from "@/components/Header/Header";
import '@mantine/carousel/styles.css';
import { MediaCardGrid } from '@/components/Grid/CardGrid';
import BrowseActions from '@/components/BrowseActions/BrowseActions';
import { useEffect, useMemo, useState } from 'react';
import {  getAllFilteredActiveMedia } from "@/services/MediaService";
import { MediaCardProps } from '@/components/Cards/MediaCard';
import { FilterPricePopover, FilterValuePopover } from '@/components/BrowseActions/Filters/FilterPopover';
import { useTranslations } from "next-intl";
import { IconSearch } from '@tabler/icons-react';


function BrowsePage() {
  const t = useTranslations('browse');
  // Lists
  const [media, setMedia] = useState<MediaCardProps[]>([]);


  const ITEMS_PER_PAGE = 16;
  const [activePage, setActivePage] = useState(1);

  const totalPages = Math.ceil(media.length / ITEMS_PER_PAGE);

  // Filters
  const [draftTitleFilter, setDraftTitleFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [minPrice, setMinPrice] = useState<number|null>(null);
  const [maxPrice, setMaxPrice] = useState<number|null>(null);
  const [minImpressions, setMinImpressions] = useState<number|null>(null);



  useEffect(() => {
    getAllFilteredActiveMedia(titleFilter, minPrice, maxPrice, minImpressions)
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
          dailyImpressions: m.dailyImpressions ?? 0,
          typeOfDisplay: m.typeOfDisplay,
          imageUrl: m.imageUrl,
        }));

        setMedia(mapped);
        setActivePage(1);
      })
      .catch((err) => {
        console.error("Failed to load media:", err);
      });
}, [titleFilter, minPrice, maxPrice, minImpressions]);


  const paginatedMedia = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return media.slice(start, end);
  }, [media, activePage]);


  function filters(){
  return(
    <>
      <FilterPricePopover minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} setMaxPrice={setMaxPrice}/>
      <FilterValuePopover value={minPrice} setValue={setMinImpressions} label={t('filters.impressions')} placeholder={t('filters.impressions')}/>
    </>
  )
}

  return (
    <>
      <Header />

      <Container size="xl" py={20} px={80}>
        <Stack gap="sm">
          <TextInput
            placeholder="Search title"
            value={draftTitleFilter}
            onChange={(event) => setDraftTitleFilter(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setTitleFilter(draftTitleFilter);
              }
            }}
            rightSection={
              <ActionIcon onClick={() => setTitleFilter(draftTitleFilter)}>
                <IconSearch size={16} />
              </ActionIcon>
            }
          />


          <BrowseActions filters={filters()}/>
          {paginatedMedia.length > 0 ? (<MediaCardGrid medias={paginatedMedia} />):
            ( 
              <Stack h='20em' justify='center' align='center'>
                <Text size='32px'>{t('nomedia.notfound')}</Text>
                <Text>{t('nomedia.changefilters')}</Text>
              </Stack>
            )

          }

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
