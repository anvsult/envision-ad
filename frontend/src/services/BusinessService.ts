import { BusinessRequest, BusinessResponse } from "@/types/BusinessTypes";
import {getAccessToken} from "@auth0/nextjs-auth0";
import {EmployeeType} from "@/types/EmployeeType";
import {InvitationRequest, InvitationResponse} from "@/types/InvitationType";

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
    const res = await fetch(`${API_BASE_URL}/employee/${encodeURI(id)}`, {
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

export const getAllBusinessEmployees = async (businessId: string): Promise<EmployeeType[]> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${businessId}/employees`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to remove employee from business: ${res.statusText}`);
    }

    return res.json();
}

export const removeEmployeeFromBusiness = async (businessId : string, employeeId : string) : Promise<void> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${businessId}/employees/${encodeURI(employeeId)}`, {
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

export const createInviteEmployeeToBusiness = async (businessId : string, invitation : InvitationRequest) : Promise<void> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${businessId}/invites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
        body: JSON.stringify(invitation)
    });

    if (!res.ok) {
        throw new Error(`Failed to invite to business: ${res.statusText}`);
    }

    return res.json();
}

export const cancelInviteEmployeeToBusiness = async (businessId : string, invitationId : string) : Promise<void> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${businessId}/invites/${invitationId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to invite to business: ${res.statusText}`);
    }
}

export const getAllBusinessInvitations = async (businessId : string) : Promise<InvitationResponse[]> => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${businessId}/invites`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${token}`
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to get business invitations: ${res.statusText}`);
    }

    return res.json();
}

export const addEmployeeToBusiness = async (businessId : string, token: string) : Promise<void> => {
    const authToken = await getAccessToken();
    const res = await fetch(`${API_BASE_URL}/${businessId}/employees?token=${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization : `Bearer ${authToken}`
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to join business: ${res.statusText}`);
    }
}