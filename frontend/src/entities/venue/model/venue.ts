export interface Venue {
    venueId: string;
    nameEn: string;
    nameFr: string;
    colorCode: string;
    mediaCount: number;
}

export interface VenueRequestDTO {
    nameEn: string;
    nameFr: string;
    colorCode: string;
}
