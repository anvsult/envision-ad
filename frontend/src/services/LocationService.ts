
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
  lat: number,
  lng: number,
  address?: {
    road?: string,
    house_number?: string,
    city?: string,
    state?: string,
    country?: string
  },
  
}


//
export async function SearchLocations(query: string, language: string) {
  if (!query || query.length < 3) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
      `format=json&addressdetails=1&limit=5` +
      `&q=${encodeURIComponent(query)}` +
      `&accept-language=${encodeURIComponent(language)}`,
    {
      headers: {
        "User-Agent": "Visual-Impact"
      }
    }
  );

  const data = await res.json();

  console.log(data);
  return data.map((item: AddressDetails) => ({
    display_name: item.display_name
  }));
}

// Returns an address object, including Lat and Lng
export async function GetAddressDetails(query: string, language: string): Promise<AddressDetails> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
      `format=json&addressdetails=1&limit=1` +
      `&q=${encodeURIComponent(query)}` +
      `&accept-language=${encodeURIComponent(language)}`,
    {
      headers: {
        "User-Agent": "Visual-Impact"
      }
    }
  );

  const data = await res.json();

  console.log(data[0]);
  const addressDetails:AddressDetails = {
    display_name: data[0].display_name,
    address: data[0].address,
    lat: data[0].lat,
    lng: data[0].lon
  };

  console.log(addressDetails);
  return addressDetails;
}

// Get the user's latitude and longitude
export function GetUserGeoLocation(): Promise<LatLngLiteral> {
  return new Promise((resolve, reject) => {
    const storedLocation = sessionStorage.getItem("userLocation");

    if (storedLocation) {
      const location: LatLngSession = JSON.parse(storedLocation);

      if (new Date().getTime() <= location.expiryTime) {
        resolve({ lat: location.lat, lng: location.lng });
        return;
      }

      sessionStorage.removeItem(userLocationKey);
    }

    if (!("geolocation" in navigator)) {
      reject({ code: 'UNSUPPORTED' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        storeLatLngSession(coords);
        resolve(coords);
      },
      (error) => {
        reject(error);
      }
    );
  });
}


