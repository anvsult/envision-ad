export interface Ad {
    adId: string;
    campaignId: string;
    name: string;
    adUrl: string;
    adType: "IMAGE" | "VIDEO";
}

export interface AdRequestDTO {
    name: string;
    adUrl: string;
    adType: "IMAGE" | "VIDEO";
}