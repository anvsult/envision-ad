export enum CompanySize {
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    ENTERPRISE = "ENTERPRISE",
}

export interface BusinessRequest {
    name: string;
    companySize: CompanySize;
    address: Address;
    roles: Roles;
}

export interface BusinessResponse {
    businessId: string;
    name: string;
    ownerId: string;
    companySize: CompanySize | string; // Handle potential string response from backend if enum serialization varies
    address: Address;
    roles: Roles;
    dateCreated: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Roles {
    mediaOwner: boolean;
    advertiser: boolean;
}
