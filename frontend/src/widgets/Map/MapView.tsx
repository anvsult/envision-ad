import { MapContainer, Marker, TileLayer, useMap} from 'react-leaflet';
import {  Badge, Paper } from '@mantine/core';
import 'leaflet/dist/leaflet.css';
import L, { LatLngLiteral, Map } from 'leaflet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MediaCardProps } from '../Cards/MediaCard';
import { MediaLocation } from '@/entities/media';
import './MapView.css';

const default_zoom = 10;



interface MapViewProps {
  center: LatLngLiteral;
  medias?: MediaCardProps[];
  setMap: React.Dispatch<React.SetStateAction<Map|null>>;
  isMobile: boolean;
  
}


interface MediaMarkerProps{
  media: MediaCardProps;
}


function MediaMarker({media}: MediaMarkerProps){

  const mediaMarkerIcon = L.divIcon({
    className: 'media-marker',
    html: `<a href='#MediaCard${media.index}'><span >$${media.price.toString()}</span><a>`,
    iconSize: [200, 30],
    iconAnchor: [100, 15]
    
  });


  return (
    <Marker position={{lat: media.mediaLocation.latitude, lng: media.mediaLocation.longitude}} icon={mediaMarkerIcon}/>
  )
}

export default function MapView({center, setMap,  medias, isMobile}: MapViewProps){

  const displayMap = useMemo(
    () => (
        <MapContainer
          center={center}
          zoom={default_zoom}
          scrollWheelZoom={true}
          ref={setMap}
          style={{height: "100%", width: "100%"}}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {medias?.map((media: MediaCardProps) => (
            <MediaMarker key={media.index} media={media}/>
          ))
          }
        </MapContainer>
      ) ,
    [center, medias, setMap],
  )

    return(
        <Paper radius="lg" style={{position:"sticky", overflow: "hidden", height:(isMobile ? "35vh" : "90vh")}}>
           
           {displayMap}
            
        </Paper>
    )

}