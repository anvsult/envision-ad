'use client'

import {ActionIcon, Autocomplete, Container, Group, Loader, Pagination, Stack, Text, TextInput} from '@mantine/core';
import '@mantine/carousel/styles.css';
import { MediaCardGrid } from '@/widgets/Grid/CardGrid';
import BrowseActions from '@/widgets/BrowseActions/BrowseActions';
import { useEffect, useMemo, useState } from 'react';
import {getAllFilteredActiveMedia, SpecialSort} from "@/features/media-management/api";
import { MediaCardProps } from '@/widgets/Cards/MediaCard';
import { FilterPricePopover, FilterValuePopover } from '@/widgets/BrowseActions/FilterPopover';
import { useTranslations } from "next-intl";
import { IconSearch } from '@tabler/icons-react';
import { AddressDetails, GetAddressDetails, GetUserGeoLocation, SearchLocations} from '@/shared/lib/geolocation';

import { LatLngLiteral } from 'leaflet';
import { FilteredActiveMediaProps, MediaStatus } from '@/entities/media/model/media';
import { LocationStatus } from '@/shared/lib/geolocation/LocationService';
import { useMediaList } from '@/features/media-management/api/useMediaList';
import { MediaCardCarousel } from '@/widgets/Carousel/CardCarousel';

function BrowsePage() {
  const t = useTranslations('browse');
  const sortNearest = t('browseactions.sort.nearest');
  const searchLanguage = `${t('languages.primary')},${t('languages.fallback')}`
  
  // Lists
  const ITEMS_PER_PAGE = 16;
  const [activePage, setActivePage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Filters
  const [draftTitleFilter, setDraftTitleFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [draftAddressSearch, setDraftAddressSearch] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number|null>(null);
  const [maxPrice, setMaxPrice] = useState<number|null>(null);
  const [minImpressions, setMinImpressions] = useState<number|null>(null);
  const [location, setLocation] = useState<LatLngLiteral | null>(null);
  const [sortBy, setSortBy] = useState<string>(SpecialSort.nearest);

  
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>('idle');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');

  const filteredMediaProps = useMemo(() => ({
    title: titleFilter,
    minPrice,
    maxPrice,
    minDailyImpressions: minImpressions,
    sort: sortBy,
    latLng: location,
    page: activePage - 1,
    size: ITEMS_PER_PAGE
  }), [
    titleFilter,
    minPrice,
    maxPrice,
    minImpressions,
    sortBy,
    location,
    activePage
  ]);

  const media = useMediaList({ 
    filteredMediaProps: filteredMediaProps, 
    loadingLocation: locationStatus === 'loading',
    setMediaStatus: setMediaStatus });

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
            setLocation(coords);
            setLocationStatus('success');
          }
        } else {
          const address = await GetAddressDetails(addressSearch, searchLanguage);

          if (!address){
            throw new Error();
          }

          if (!cancelled) {
            setLocation({ lat: address.lat, lng: address.lng });
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
            <>
            <MediaCardGrid medias={media} />
            {/* <MediaCardCarousel id="Other Media Carousel" title="Other medias by this Media Owner" medias={media}/> */}
            </>
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
