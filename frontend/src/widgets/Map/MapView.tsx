import { MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import {  Paper } from '@mantine/core';
import 'leaflet/dist/leaflet.css';
import L, { LatLngLiteral, Map } from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import MediaCard, { MediaCardProps } from '../Cards/MediaCard';
import './MapView.css';

interface MapViewProps {
  center: LatLngLiteral;
  zoom: number;
  medias?: MediaCardProps[][];
  setMap: React.Dispatch<React.SetStateAction<Map|null>>;
  isMobile: boolean;
  
}

interface MediaMarkerProps{
  media: MediaCardProps;
}

function MediaMarker({media}: MediaMarkerProps){
  const priceNum = Number(media.price);
  const safePrice = Number.isFinite(priceNum) ? priceNum.toString() : '0';
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  const popupRef = useRef<L.Popup>(null);

  const mediaMarkerIcon = L.divIcon({
    className: 'media-marker',
    html: `<span id='MediaMarker${media.index}'><a>$${safePrice}</a><span>`,
  });

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const update = () => {
      const el = marker.getElement();
      if (!el) return;

      const inner = el.querySelector("span") as HTMLElement | null;
      if (!inner) return;

      const rect = inner.getBoundingClientRect();

      marker.setIcon(
        L.divIcon({
          className: "media-marker",
          html: el.innerHTML,
          iconSize: [rect.width, rect.height],
          iconAnchor: [rect.width / 2, rect.height / 2],
        })
      );
    };

    requestAnimationFrame(update);
  }, [mediaMarkerIcon]);

  
  useEffect(() => {
  const marker = markerRef.current;
  if (!marker) return;

  marker.on("popupopen", (e) => {
    const popup = popupRef.current;
    if (!popup) return;

    requestAnimationFrame(() => {
      const popupEl = popup.getElement();
      const markerEl = marker.getElement();
      if (!popupEl || !markerEl) return;

      const markerRect = markerEl.getBoundingClientRect();
      const popupRect = popupEl.getBoundingClientRect();
      const mapRect = map.getContainer().getBoundingClientRect();

      let offsetX = 0;
      let offsetY = 0;

      if (markerRect.top < mapRect.top + mapRect.height / 2) {
        offsetY = popupRect.height + markerRect.height + 10;
      }

      if (popupRect.right > mapRect.right) {
        offsetX = mapRect.right - popupRect.right - 10;
      }
      if (popupRect.left < mapRect.left) {
        offsetX = mapRect.left - popupRect.left + 10;
      }
      if (popupRect.top + offsetY < mapRect.top) {
        offsetY = mapRect.top - popupRect.top + 10;
      }

      popup.options.offset = L.point(offsetX, offsetY);
      popup.update();
    });
  });
  }, [map, markerRef, popupRef]);


  return (

    <Marker ref={markerRef} position={{lat: media.mediaLocation?.latitude ?? 0 , lng: media.mediaLocation?.longitude ?? 0}} icon={mediaMarkerIcon}>
      <Popup ref={popupRef} minWidth={250} maxWidth={250} autoPan={false}>
        <MediaCard 
          index={media.index}
          href={media.href}
          title={media.title}
          imageUrl={media.imageUrl}
          imageRatio={4/3}
          organizationId={media.organizationId}
          organizationName={media.organizationName}
          resolution={media.resolution}
          aspectRatio={media.aspectRatio}
          price={media.price}
          typeOfDisplay={media.typeOfDisplay}
          dailyImpressions={media.dailyImpressions}
          mobileWidth={"768px"}
        />
      </Popup>
    </Marker>
  )
}

export default function MapView({center, zoom, setMap, medias, isMobile}: MapViewProps){

  const displayMap = useMemo(
    () => (
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          ref={setMap}
          style={{height: "100%", width: "100%"}}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {medias?.map((media: MediaCardProps[]) => (
            <MediaMarker key={media} media={media}/>
          ))}
        </MapContainer>
      ) ,
    [center, medias, setMap, zoom],
  )

    return(
        <Paper radius="lg" style={{position:"sticky", overflow: "hidden", height:(isMobile ? "35vh" : "90vh")}}>
           
           {displayMap}
            
        </Paper>
    )

}