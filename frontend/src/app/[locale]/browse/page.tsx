'use client'

import { ActionIcon, Autocomplete, Container, Group, Loader, Pagination, Stack, Text, TextInput } from '@mantine/core';
import { Header } from "@/components/Header/Header";
import '@mantine/carousel/styles.css';
import { MediaCardGrid } from '@/components/Grid/CardGrid';
import BrowseActions from '@/components/BrowseActions/BrowseActions';
import { useEffect, useState } from 'react';
import {  getAllFilteredActiveMedia, SpecialSort } from "@/services/MediaService";
import { MediaCardProps } from '@/components/Cards/MediaCard';
import { FilterPricePopover, FilterValuePopover } from '@/components/BrowseActions/FilterPopover';
import { useTranslations } from "next-intl";
import { IconSearch } from '@tabler/icons-react';
import { AddressDetails, GetAddressDetails, GetUserGeoLocation, SearchLocations} from '@/services/LocationService';
import { LatLngLiteral } from 'leaflet';

function BrowsePage() {
  const t = useTranslations('browse');
  const sortNearest = t('browseactions.sort.nearest');
  const searchLanguage = `${t('languages.primary')},${t('languages.fallback')}}`
  // Lists
  const [media, setMedia] = useState<MediaCardProps[]>([]);

  const ITEMS_PER_PAGE = 16;
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [draftTitleFilter, setDraftTitleFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [draftAddressSearch, setDraftAddressSearch] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number|null>(null);
  const [maxPrice, setMaxPrice] = useState<number|null>(null);
  const [minImpressions, setMinImpressions] = useState<number|null>(null);
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [sortBy, setSortBy] = useState<string>(SpecialSort.nearest);
  
  type MediaStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>('idle');

  type LocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error';
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');


  
  useEffect(() => {
    let cancelled = false;

    async function resolveLocation() {
      setLocationStatus('loading');

      try {
        if (
          sortBy === SpecialSort.nearest &&
          (!addressSearch || addressSearch === sortNearest)
        ) {
          const coords = await GetUserGeoLocation();
          if (!cancelled) {
            setUserLocation(coords);
            setLocationStatus('success');
          }
        } else {
          const address = await GetAddressDetails(addressSearch, searchLanguage);
          if (!cancelled) {
            setUserLocation({ lat: address.lat, lng: address.lng });
            setLocationStatus('success');
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (err instanceof GeolocationPositionError && err.code === 1) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('error');
        }
      }
    }
    resolveLocation();
    return () => { cancelled = true };
  }, [addressSearch, searchLanguage, sortBy, sortNearest]);



  // Update Media List
  useEffect(() => {
    if (sortBy === SpecialSort.nearest && locationStatus === 'loading') {
      return;
    }


    let cancelled = false;

    async function loadMedia() {
      setMediaStatus('loading');

      try {
        const data = await getAllFilteredActiveMedia(
          titleFilter,
          null,
          minPrice,
          maxPrice,
          minImpressions,
          sortBy,
          userLocation,
          activePage - 1,
          ITEMS_PER_PAGE
        );

        if (cancelled) return;

        const items = (data.content || [])
          .filter((m) => m.id != null)
          .map((m, index) => ({
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

        setMedia(items);
        setTotalPages(data.totalPages);

        setMediaStatus(items.length === 0 ? 'empty' : 'success');
      } catch {
        if (!cancelled) {
          setMediaStatus('error');
        }
      }
    }

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [titleFilter, minPrice, maxPrice, minImpressions, userLocation, sortBy, activePage, locationStatus]);

  
  

  useEffect(() => {
    const timeout = setTimeout(async () => {
        if (!draftAddressSearch) {
          
          return;
        }

        const results: AddressDetails[] = await SearchLocations(draftAddressSearch, searchLanguage);

        const uniqueResults: string[] = results.map((r) => r.display_name);
        
        const nearest: string = sortNearest;
        const newResults = [...new Set([nearest].concat(uniqueResults))];

        setLocationOptions(newResults);
      }, 300);
      return () => clearTimeout(timeout);
  }, [draftAddressSearch, searchLanguage, sortNearest]);


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
              placeholder={t('searchTitle')}
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
              placeholder={t('searchAddress')}
              data={locationOptions.map((o) => o)}
              value={draftAddressSearch}
              onChange={ setDraftAddressSearch }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setAddressSearch(draftAddressSearch);
                }
              }}
              rightSection={
                <ActionIcon onClick={() => setAddressSearch(draftAddressSearch)}>
                  <IconSearch size={16} />
                </ActionIcon>
              }
            />
          </Group>
          <BrowseActions filters={filters()} setSortBy={setSortBy} sortSelectValue={sortBy}/>

          {locationStatus === 'loading' || (mediaStatus === 'loading' && sortBy === SpecialSort.nearest) ? (
            <Stack h="20em" justify="center" align="center">
              <Loader />
            </Stack>
          ) : locationStatus === 'denied' ? (
            <Stack h="20em" justify="center" align="center">
              <Text>{t('nomedia.locationDenied')}</Text>
            </Stack>
          ) : mediaStatus === 'error' ? (
            <Stack h="20em" justify="center" align="center">
              <Text>{t('nomedia.failedToLoad')}</Text>
            </Stack>
          ) : mediaStatus === 'empty' ? (
            <Stack h="20em" justify="center" align="center">
              <Text size="32px">{t('nomedia.notfound')}</Text>
              <Text>{t('nomedia.changefilters')}</Text>
            </Stack>
          ) : (
            <MediaCardGrid medias={media} />
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
