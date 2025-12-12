
import { getJoinedAddress, MediaLocationDTO } from '@/types/MediaTypes';
import { LatLng } from 'leaflet'; 

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

  const latlng = await new LatLng(data.latitude, data.longitude);
  console.log(latlng);
  return latlng;
  
}


export function GetUserGeoLocation(
  setUserLocation: React.Dispatch<React.SetStateAction<LatLng | null>>,
  setError: React.Dispatch<React.SetStateAction<string>>
) {
    setUserLocation(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newMapCoords:LatLng = new LatLng(position.coords.latitude, position.coords.longitude);
          setUserLocation(newMapCoords);
        },
        () => {
          setError('nomedia.noUserLocation');
        },
      );
    } else {
      setError('nomedia.noSupport');
    }
}

