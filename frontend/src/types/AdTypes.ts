export interface Ad {
    adId: string;
    campaignId: string;
    name: string;
    adUrl: string;
    adDurationSeconds: number;
    adType: "IMAGE" | "VIDEO";
}

export interface AdCampaign {
    campaignId: string;
    name: string;
    startDate: string; // or Date
    endDate: string;   // or Date
    ads: Ad[];
}

export interface CreateAdPayload {
    name: string;
    adUrl: string;
    adDurationSeconds: number;
    adType: "IMAGE" | "VIDEO";
}