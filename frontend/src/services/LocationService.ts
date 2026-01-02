
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

export interface AddressDetails {
  display_name: string,
  address?: {
    road?: string,
    house_number?: string,
    city?: string,
    state?: string,
    country?: string
  }
}

// locationService.ts
export async function SearchLocations(query: string) {
  if (!query || query.length < 3) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": "visual-impact"
      }
    }
  );

  const data = await res.json();

  return data.map((item: AddressDetails) => ({
    display_name: item.display_name
  }));
}

export async function GetAddressDetails(query: string) {
  if (!query || query.length < 3) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": "Visual Impact"
      }
    }
  );

  const data = await res.json();

  return data.map((item: AddressDetails) => ({
    address: item.address
  }));
}


// Get the user's latitude and longitude
export function GetUserGeoLocation(
  setUserLocation: React.Dispatch<React.SetStateAction<LatLngLiteral | null>>,
  setError: React.Dispatch<React.SetStateAction<string | undefined>>
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

