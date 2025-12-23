import { getAccessToken } from "@auth0/nextjs-auth0";
import {CreateReservationPayload, ReservationResponse} from "@/types/ReservationTypes";

// Ensure this matches your Spring Boot Controller Route
const API_BASE_URL = "http://localhost:8080/api/v1/reservations";

export const createReservation = async (payload: CreateReservationPayload): Promise<ReservationResponse> => {
    const token = await getAccessToken();
    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
    });

    // If the request fails (404, 409, 500), we throw the Response object
    // so the UI can check the status code.
    if (!res.ok) {
        throw res;
    }

    return res.json();
};