export enum CompanySize {
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    ENTERPRISE = "ENTERPRISE",
}

export interface BusinessRequest {
    name: string;
    owner: string;
    companySize: CompanySize;
    address: AddressRequest;
    roles: RolesRequest;
}

export interface AddressRequest {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface AddressResponse {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface BusinessResponse {
    businessId: string;
    name: string;
    owner: string;
    companySize: CompanySize | string; // Handle potential string response from backend if enum serialization varies
    address: AddressResponse;
    roles: RolesResponse;
    employees: string[];
    dateCreated: string;
}

export interface RolesResponse {
    mediaOwner: boolean;
    advertiser: boolean;
}

export interface RolesRequest {
    mediaOwner: boolean;
    advertiser: boolean;
}
