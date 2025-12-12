import { getJoinedAddress, MediaLocationDTO } from '@/types/MediaTypes';
import * as L from 'leaflet'; 
import 'leaflet-geosearch/assets/css/leaflet.css';

export async function getAddressLocation(mediaLocation: MediaLocationDTO) {

  const address = getJoinedAddress([mediaLocation.street, mediaLocation.city, mediaLocation.province, mediaLocation.country]);
  const url = `${location.protocol}//nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "your-app-name"
    }
  });

  const data = await response.json();

  const latlng = await new L.LatLng(data.latitude, data.longitude);
  console.log(latlng);
  return latlng;
  
}


export function getUserGeoLocation(
  setUserLocation: React.Dispatch<React.SetStateAction<L.LatLng | null>>,
  setError: React.Dispatch<React.SetStateAction<string>>
) {
    setUserLocation(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newMapCoords:L.LatLng = new L.LatLng(position.coords.latitude, position.coords.longitude);
          setUserLocation(newMapCoords);
        },
        (err) => {
          setError(err.message);
        },
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
}

