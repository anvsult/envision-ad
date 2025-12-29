'use server';

import { getAccessToken } from "@auth0/nextjs-auth0";
import { ReservationRequestDTO, ReservationResponseDTO } from "@/entities/reservation";

const API_BASE_URL = "http://localhost:8080/api/v1/reservations";

export const createReservation = async (payload: ReservationRequestDTO): Promise<ReservationResponseDTO> => {
    // FIX: Cast to 'any' to bypass the TS error.
    // We know at runtime this returns an object { accessToken: string },
    // even if your local type definitions claim it returns a String.
    const tokenResult = await getAccessToken() as any;
    const accessToken = tokenResult?.accessToken || tokenResult;

    if (!accessToken) {
        throw new Error("Authentication required: No access token found.");
    }

    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    // Handle errors (read text first to avoid JSON parse errors on crash)
    const bodyText = await res.text();

    if (!res.ok) {
        throw new Error(bodyText || `Request failed with status ${res.status}`);
    }

    return JSON.parse(bodyText) as ReservationResponseDTO;
};