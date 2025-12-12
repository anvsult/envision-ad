import { BusinessRequest, BusinessResponse } from "@/types/BusinessTypes";
import {getAccessToken} from "@auth0/nextjs-auth0";

const API_BASE_URL = "http://localhost:8080/api/v1/businesses";

export const getAllBusinesses = async (): Promise<BusinessResponse[]> => {
    const token = await getAccessToken();
    const res = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
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
    const token = await getAccessToken();
    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to create business: ${res.statusText}`);
    }

    return res.json();
};

export const getBusinessById = async (id: string): Promise<BusinessResponse> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch business: ${res.statusText}`);
    }

    return res.json();
};

export const updateBusiness = async (
    id: string,
    data: BusinessRequest
): Promise<BusinessResponse> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to update business: ${res.statusText}`);
    }

    return res.json();
};

export const getEmployeeBusiness = async (id: string): Promise<BusinessResponse> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/employee/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to get business: ${res.statusText}`);
    }

    return res.json();
}

export const removeEmployeeFromBusiness = async (businessId : string, employeeId : string) : Promise<void> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${businessId}/employees/${employeeId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to remove employee from business: ${res.statusText}`);
    }
}

export const inviteEmployeeToBusiness = async (id : string, email : string) : Promise<void> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${id}/invite?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to invite to business: ${res.statusText}`);
    }

    return res.json();
}
