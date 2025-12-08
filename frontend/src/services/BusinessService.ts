import { BusinessRequest, BusinessResponse } from "../types/BusinessTypes";

const API_BASE_URL = "http://localhost:8080/api/v1/businesses";

export const getAllBusinesses = async (): Promise<BusinessResponse[]> => {
    const res = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        // If using Next.js caching, you might want { cache: 'no-store' } or similar
        // depending on requirements. For dashboard data, valid revalidation or no-store is usually best.
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch businesses: ${res.statusText}`);
    }

    return res.json();
};

export const createBusiness = async (
    data: BusinessRequest
): Promise<BusinessResponse> => {
    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to create business: ${res.statusText}`);
    }

    return res.json();
};
