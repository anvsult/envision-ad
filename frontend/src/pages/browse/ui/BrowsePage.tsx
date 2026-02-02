'use client'

import {ActionIcon, Autocomplete, Button, Container, Group, Loader, Pagination, Stack, Text, TextInput} from '@mantine/core';
import { MediaCardGrid } from '@/widgets/Grid/CardGrid';
import BrowseActions from '@/widgets/BrowseActions/BrowseActions';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {SpecialSort} from "@/features/media-management/api";
import { FilterPricePopover, FilterValuePopover } from '@/widgets/BrowseActions/FilterPopover';
import { useTranslations } from "next-intl";
import { IconMap, IconSearch } from '@tabler/icons-react';
import { AddressDetails, GetAddressDetails, GetUserGeoLocation, SearchLocations} from '@/shared/lib/geolocation';

import { LatLngBounds, LatLngLiteral, Map } from 'leaflet';
import { MediaStatus } from '@/entities/media/model/media';
import { LocationStatus } from '@/shared/lib/geolocation/LocationService';
import { useMediaList } from '@/features/media-management/api/useMediaList';
import { SortOptions } from '@/features/media-management/api/getAllFilteredActiveMedia';
import MapView from '@/widgets/Map/MapView';
import { useMediaQuery } from '@mantine/hooks';

function SearchMobileViewer({children}: Readonly<{children: React.ReactNode;}>){
    const isMobile = useMediaQuery("(max-width: 575px)");
    return(
            isMobile ? 
            <Stack>{children}</Stack>:
            <Group grow>{children}</Group>
    )
}

function BrowsePage() {

  const isMobile = useMediaQuery("(max-width: 768px)");
  const defaultPos = {lat: 45.516476848520064, lng: -73.52053208741675};

  const t = useTranslations('browse');
  const sortNearest = t('browseactions.sort.nearest');
  const searchLanguage = `${t('languages.primary')},${t('languages.fallback')}`
  
  // Lists
  const ITEMS_PER_PAGE = 16;
  const [activePage, setActivePage] = useState<number>(1);
  const [totalPages] = useState<number>(1);
  
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
  const [sortBy, setSortBy] = useState<string>(SortOptions.priceAsc);
  
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>('idle');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');


  // Map
  const defaultZoom = 12;
  const [mapVisible, setMapVisible] = useState<boolean>(false);
  const [map, setMap] = useState<Map|null>(null);
  const [bbox, setBbox] = useState<LatLngBounds | null>(null);
  const [draftBbox, setDraftBbox] = useState<LatLngBounds | null>(null);

  const filteredMediaProps = useMemo(() => ({
    title: titleFilter,
    minPrice,
    maxPrice,
    minDailyImpressions: minImpressions,
    sort: sortBy,
    latLng: location,
    bounds: bbox,
    page: activePage - 1,
    size: ITEMS_PER_PAGE
  }), [titleFilter, minPrice, maxPrice, minImpressions, sortBy, location, bbox, activePage]);

  const media = useMediaList({ 
    filteredMediaProps: filteredMediaProps, 
    loadingLocation: locationStatus === 'loading',
    setMediaStatus});

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
            const coords = { lat: address.lat, lng: address.lng };
            setLocation(coords);
            setLocationStatus('success');
            map?.setView(coords, defaultZoom);
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (err instanceof GeolocationPositionError && err.code === 1) {
          setLocationStatus('denied');
          if (sortBy === SpecialSort.nearest) {
            setSortBy(SortOptions.priceAsc);
          }
        } else {
          setLocationStatus('error');
        }
      }
    }
    resolveLocation();
    return () => { cancelled = true };
  }, [addressSearch, map, searchLanguage, sortBy, sortNearest]);

  useEffect(() => {
    if (addressSearch) {
      setMapVisible(true);
    }
  }, [addressSearch]);


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
      }, 100);
      return () => clearTimeout(timeout);
  }, [draftAddressSearch, searchLanguage, sortNearest]);



  const onMove = useCallback(() => {
    setDraftBbox(map ? map.getBounds(): null)
  }, [map])

  useEffect(() => {
    if (!draftBbox) {
      setBbox(null);
      return;
    }

    const timeout = setTimeout(() => {
      setBbox(draftBbox);
    }, 300);

    return () => clearTimeout(timeout);

  }, [draftBbox])
  
  
  useEffect(() => {
    map?.on('moveend', onMove);
    map?.on('load', onMove);
  }, [map, onMove])

  useEffect(() => {
    if (mapVisible) {
      onMove();
    } else {
      setDraftBbox(null);
    }
  }, [mapVisible, onMove])

  function filters(){
    return(
      <>
        <FilterPricePopover id='PriceFilter' minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} setMaxPrice={setMaxPrice}/>
        <FilterValuePopover id='ImpressionsFilter' value={minImpressions} setValue={setMinImpressions} label={t('browseactions.filters.impressions')} placeholder={t('browseactions.filters.impressions')}/>
      </>
    )
  }


  return (
      <Container size={map ? 1600 : "xl"} w="100%" py={20} >
        <Group grow h="100%" top="0" justify='flex-start'>
          <Stack gap="sm" mih="95vh" top="0" justify='flex-start'>
              <SearchMobileViewer>
                <Autocomplete
                  placeholder={t('searchAddress')}
                  id='AddressSearch'
                  data={locationOptions.map((o) => o)}
                  
                  value={draftAddressSearch}
                  onChange={ setDraftAddressSearch }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setAddressSearch(draftAddressSearch);
                    }
                  }}
                  rightSection={
                    <ActionIcon id='AddressSearchButton' onClick={() => setAddressSearch(draftAddressSearch)}>
                      <IconSearch size={16} />
                    </ActionIcon>
                  }
                />
                <TextInput
                  placeholder={t('searchTitle')}
                  id='TitleSearch'
                  value={draftTitleFilter}
                  onChange={(event) => setDraftTitleFilter(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setTitleFilter(draftTitleFilter);
                    }
                  }}
                  rightSection={
                    <ActionIcon id='TitleSearchButton' onClick={() => setTitleFilter(draftTitleFilter)}>
                      <IconSearch size={16} />
                    </ActionIcon>
                  }
                />
                
              </SearchMobileViewer>
              <BrowseActions filters={filters()} setSortBy={setSortBy} sortSelectValue={sortBy}/>
              
              {(isMobile && mapVisible) && 
                <Container style={{position: "relative",  width: "100%"}} p="0">
                  <MapView center={location ?? defaultPos} zoom={defaultZoom} medias={media} setMap={setMap} isMobile={isMobile}/>
                </Container>
              }

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
              <MediaCardGrid medias={media} size={(mapVisible && !isMobile)? 2 : 1} />
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

        {(!isMobile && mapVisible) && 
          <Container p={0} style={{position: "sticky", top: "5vh", bottom: "5vh"}}>
            <MapView center={location ?? defaultPos} zoom={defaultZoom} medias={media} setMap={setMap} isMobile={isMobile}/>
          </Container>
        }
        
        </Group>
        <Group pos='fixed' justify='flex-end'  mt="xl" right='3vh' bottom='3vh' w='100%'>
          <Button size='lg' rightSection={<IconMap size={30} />} onClick={() => setMapVisible(!mapVisible)} radius='xl' >
            {mapVisible ? t('closeMap') : t('openMap')}
          </Button>
        </Group>
      </Container>
  );
}

export default BrowsePage;
