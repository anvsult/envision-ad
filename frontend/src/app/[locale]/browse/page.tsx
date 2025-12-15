'use client'

import { ActionIcon, Autocomplete, Container, Group, Loader, Pagination, Stack, Text, TextInput } from '@mantine/core';
import { Header } from "@/components/Header/Header";
import '@mantine/carousel/styles.css';
import { MediaCardGrid } from '@/components/Grid/CardGrid';
import BrowseActions from '@/components/BrowseActions/BrowseActions';
import { useEffect, useState } from 'react';
import {  getAllFilteredActiveMedia } from "@/services/MediaService";
import { MediaCardProps } from '@/components/Cards/MediaCard';
import { FilterPricePopover, FilterValuePopover } from '@/components/BrowseActions/FilterPopover';
import { useTranslations } from "next-intl";
import { IconSearch } from '@tabler/icons-react';
import { AddressDetails, GetUserGeoLocation, SearchLocations} from '@/services/LocationService';
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
  const [draftLocationFilter, setDraftLocationFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [locationOptions, setLocationOptions] = useState<AddressDetails[]>([]);
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
    
    getAllFilteredActiveMedia(titleFilter, locationFilter, minPrice, maxPrice, minImpressions, sortBy, userLocation, activePage - 1, ITEMS_PER_PAGE)
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
  }, [titleFilter, locationFilter,  minPrice, maxPrice, minImpressions, userLocation, sortBy, activePage]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
        if (!draftLocationFilter) {
          
          return;
        }

        const results: AddressDetails[] = await SearchLocations(draftLocationFilter);

        const uniqueResults: AddressDetails[] = Array.from(
          new Map(results.map((r) => [r.display_name, r])).values()
        );

        setLocationOptions(uniqueResults);
      }, 300);
      return () => clearTimeout(timeout);
  }, [draftLocationFilter]);


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
      <Header />

      <Container size="xl" py={20} px={80}>
        <Stack gap="sm">
          <Group grow>
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
            <Autocomplete
              placeholder="Search location"
              data={locationOptions.map((o) => o.display_name)}
              value={draftLocationFilter}
              onChange={ setDraftLocationFilter }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setLocationFilter(draftLocationFilter);
                }
              }}
              rightSection={
                <ActionIcon onClick={() => setLocationFilter(draftLocationFilter)}>
                  <IconSearch size={16} />
                </ActionIcon>
              }
            />
          </Group>
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
