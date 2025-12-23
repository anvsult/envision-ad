'use client'

import { ActionIcon, Container, Group, Loader, Pagination, Stack, Text, TextInput } from '@mantine/core';
import { Header } from "@/components/Header/Header";
import '@mantine/carousel/styles.css';
import { MediaCardGrid } from '@/components/Grid/CardGrid';
import BrowseActions from '@/components/BrowseActions/BrowseActions';
import { useEffect, useState } from 'react';
import {  getAllFilteredActiveMedia } from "@/features/media-management/api";
import { MediaCardProps } from '@/components/Cards/MediaCard';
import { FilterPricePopover, FilterValuePopover } from '@/components/BrowseActions/FilterPopover';
import { useTranslations } from "next-intl";
import { IconSearch } from '@tabler/icons-react';
import { GetUserGeoLocation} from '@/components/Location';
import { LatLngLiteral } from 'leaflet';

function BrowsePage() {
  const t = useTranslations('browse');
  // Lists
  const [media, setMedia] = useState<MediaCardProps[]>([]);

  const ITEMS_PER_PAGE = 16;
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [draftTitleFilter, setDraftTitleFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [minPrice, setMinPrice] = useState<number|null>(null);
  const [maxPrice, setMaxPrice] = useState<number|null>(null);
  const [minImpressions, setMinImpressions] = useState<number|null>(null);
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("nearest");

  useEffect(() => GetUserGeoLocation(setUserLocation, setMessage), []);

  useEffect(() => {
    if (sortBy === "nearest" && !userLocation){
      return
    } 
    
    getAllFilteredActiveMedia(titleFilter, minPrice, maxPrice, minImpressions, sortBy, userLocation, activePage - 1, ITEMS_PER_PAGE)
      .then((data) => {
        const items = (data.content || []).filter((m) => m.id != null);

        const mapped = items.map((m, index) => ({
          index: String(index),
          href: String(m.id),
          title: m.title,
          mediaOwnerName: m.mediaOwnerName,
          mediaLocation: m.mediaLocation,
          resolution: m.resolution,
          aspectRatio: m.aspectRatio,
          price: m.price ?? 0,
          dailyImpressions: m.dailyImpressions ?? 0,
          typeOfDisplay: m.typeOfDisplay,
          imageUrl: m.imageUrl
        }));
        
        setMedia(mapped);
        setTotalPages(data.totalPages);
        
      })
      .catch(() => {
        setMessage('failedToLoad');
        setLoading(false);
      }).finally(() => {
        setLoading(false);
      });
}, [titleFilter, minPrice, maxPrice, minImpressions, userLocation, sortBy, activePage]);



  function filters(){
  return(
    <>
      <FilterPricePopover minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} setMaxPrice={setMaxPrice}/>
      <FilterValuePopover value={minImpressions} setValue={setMinImpressions} label={t('browseactions.filters.impressions')} placeholder={t('browseactions.filters.impressions')}/>
    </>
  )
}

  return (
    <>
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


          <BrowseActions filters={filters()} setSortBy={setSortBy}/>
          
            {/* if loading, show loader, if  */}
          {(media.length > 0) ? (<MediaCardGrid medias={media} />):( 
              <Stack h='20em' justify='center' align='center'>
                {(loading) ? ( (sortBy === 'nearest' && message) ? <Text>{t(message)}</Text> :<Loader/>):
                  <>
                    <Text size='32px'>{t('nomedia.notfound')}</Text>
                    <Text>{t('nomedia.changefilters')}</Text>
                  </>
                }
              </Stack>
          )}
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
