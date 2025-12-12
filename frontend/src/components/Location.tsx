
import { getJoinedAddress, MediaLocationDTO } from '@/types/MediaTypes';
import { LatLngLiteral } from 'leaflet'; 

interface LatLngSession {
  lat: number;
  lng: number;
  expiryTime: number;
}


// Stores the user location in the session storage for a set amount of time. 
// After that time is up, it will check the user's location again.
// That way you don't need to check the user's exact position every time you open the website.
const userLocationKey = "userLocation";

// TODO: Maybe check if the user is using a mobile device to set the expiry time to a shorter amount, since a mobile user might be moving more.
const expiryMinutes = 60;

function storeLatLngSession(latlng: LatLngLiteral) {
    const now = new Date();
    const expiryTime: number = now.getTime() + expiryMinutes * 60 * 1000; 
    
    const item: LatLngSession = {
        lat: latlng.lat,
        lng: latlng.lng,
        expiryTime: expiryTime,
    };
    sessionStorage.setItem(userLocationKey, JSON.stringify(item));
}

export async function getAddressLocation(mediaLocation: MediaLocationDTO) {
  
  const address = getJoinedAddress([mediaLocation.street, mediaLocation.city, mediaLocation.province, mediaLocation.country]);
  const url = `${location.protocol}//nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;

  try {
    const response = await fetch(url, {});
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No geocoding results found');
    }
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid geocoding coordinates');
    }
    const latlng: LatLngLiteral = {lat, lng};
    return latlng;
  } catch (error) {
    // You may want to handle the error differently, e.g., return null or rethrow
    throw error;
  }
}

// Get the user's latitude and longitude
export function GetUserGeoLocation(
  setUserLocation: React.Dispatch<React.SetStateAction<LatLngLiteral | null>>,
  setError: React.Dispatch<React.SetStateAction<string>>
) {

  setUserLocation(null);
  const storedLocation = sessionStorage.getItem("userLocation");
  if (storedLocation) {
      const location: LatLngSession = JSON.parse(storedLocation);
      
      if (new Date().getTime() > location.expiryTime){
        sessionStorage.removeItem(userLocationKey);
      } else {
        const sessionLatLng: LatLngLiteral = {lat: location.lat, lng: location.lng};
        setUserLocation(sessionLatLng);
        return
      }
  } 

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newMapCoords:LatLngLiteral = {lat: position.coords.latitude, lng: position.coords.longitude};
        setUserLocation(newMapCoords);
        storeLatLngSession(newMapCoords);
      },
      () => {
        setError('nomedia.noUserLocation');
      },
    );
  } else {
    setError('nomedia.noSupport');
  }
}

