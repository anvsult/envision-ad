export enum OrganizationSize {
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    ENTERPRISE = "ENTERPRISE",
}

export interface OrganizationRequestDTO {
    name: string;
    organizationSize: OrganizationSize;
    address: Address;
    roles: Roles;
}

export interface OrganizationResponseDTO {
    organizationId: string;
    name: string;
    ownerId: string;
    organizationSize: OrganizationSize | string; // Handle potential string response from backend if enum serialization varies
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
