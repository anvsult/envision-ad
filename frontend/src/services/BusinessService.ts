import { BusinessRequest, BusinessResponse } from "../types/BusinessTypes";

const API_BASE_URL = "http://localhost:8080/api/v1/businesses";

export const getAllBusinesses = async (): Promise<BusinessResponse[]> => {
    const res = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
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

export const getBusinessById = async (id: string | number): Promise<BusinessResponse> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch business: ${res.statusText}`);
    }

    return res.json();
};

export const updateBusiness = async (
    id: string | number,
    data: BusinessRequest
): Promise<BusinessResponse> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to update business: ${res.statusText}`);
    }

    return res.json();
};

export const deleteBusiness = async (id: string | number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to delete business: ${res.statusText}`);
    }
};
