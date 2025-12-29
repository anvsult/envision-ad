export interface Ad {
    adId: string;
    campaignId: string;
    name: string;
    adUrl: string;
    adDurationSeconds: number;
    adType: "IMAGE" | "VIDEO";
}

export interface AdRequestDTO {
    name: string;
    adUrl: string;
    adDurationSeconds: number;
    adType: "IMAGE" | "VIDEO";
}