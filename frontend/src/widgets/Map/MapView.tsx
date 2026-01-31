import { MapContainer, TileLayer, useMap} from 'react-leaflet';
import {  Paper } from '@mantine/core';
import 'leaflet/dist/leaflet.css';
import { LatLngLiteral, Map } from 'leaflet';
import { useCallback, useEffect, useMemo, useState } from 'react';

const default_zoom = 13;

interface MapViewProps {
  center: LatLngLiteral;
  locationStatus: string;
  markers?: LatLngLiteral[];
  map: Map|null;
  setMap: React.Dispatch<React.SetStateAction<Map|null>>;
  isMobile: boolean;
  
}


function SetPosition(map : Map, center: LatLngLiteral) {
  const [position, setPosition] = useState(() => map.getCenter())

  const onReset = useCallback(() => {
    map.setView(center, default_zoom)
  }, [center, map])

  const onMove = useCallback(() => {
    setPosition(map.getCenter())
  }, [map])

  useEffect(() => {
    map.on('move', onMove)
    return () => {
      map.off('move', onMove)
    }
  }, [map, onMove])

  return (
    null
  )
}



export default function MapView({center, map, setMap, locationStatus, markers, isMobile}: MapViewProps){



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
        </MapContainer>
      ) ,
    [center, setMap],
  )

    return(
        <Paper radius="lg" style={{position:"sticky", overflow: "hidden", height:(isMobile ? "35vh" : "90vh")}}>
           
           {displayMap}
            
        </Paper>
    )

}