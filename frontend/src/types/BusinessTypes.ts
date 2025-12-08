export enum CompanySize {
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    ENTERPRISE = "ENTERPRISE",
}

export interface BusinessRequest {
    name: string;
    companySize: CompanySize;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface AddressResponse {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface BusinessResponse {
    id: string;
    name: string;
    companySize: CompanySize | string; // Handle potential string response from backend if enum serialization varies
    address: AddressResponse;
    dateCreated: string;
}
