'use client'

import { Carousel } from "@mantine/carousel";
import { Image, Skeleton, Box } from "@mantine/core";
import { useMemo, useState } from "react";
import { Ad } from "@/entities/ad";

interface AdPreviewCarouselProps {
    selectedCampaignAds: Ad[];
    mediaImageUrl: string;
    mediaImageCorners: string;
}

const getCloudinaryPreviewUrl = (baseUrl: string, overlayUrl: string, cornersStr: string) => {
    try {
        const corners = JSON.parse(cornersStr);
        const cloudName = baseUrl.match(/cloudinary\.com\/([^/]+)\//)?.[1];
        const baseId = baseUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)?.[1];
        const overlayId = overlayUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)?.[1];

        if (!cloudName || !baseId || !overlayId) return baseUrl;

        const distort = `${corners.tl.x * 100}p:${corners.tl.y * 100}p:${corners.tr.x * 100}p:${corners.tr.y * 100}p:${corners.br.x * 100}p:${corners.br.y * 100}p:${corners.bl.x * 100}p:${corners.bl.y * 100}p`;

        // c_scale: Stretches the ad to fit the corner coordinates exactly (might distort aspect ratio).
        // c_pad: Adds padding if the ad doesn't match the aspect ratio of the target area.
        // c_fill: Crops the ad to ensure the entire target area is covered.
        const fillType = 'c_scale';
        return `https://res.cloudinary.com/${cloudName}/image/upload/l_${overlayId.replace(/\//g, ':')},fl_relative,w_1.0,h_1.0,${fillType}/e_distort:${distort},fl_layer_apply,fl_relative/${baseId}`;
    } catch {
        return baseUrl;
    }
};

const AdSlide = ({ ad, mediaImageUrl, mediaImageCorners }: { ad: Ad; mediaImageUrl: string; mediaImageCorners: string }) => {
    const [loading, setLoading] = useState(true);

    const url = useMemo(() =>
            ad.adType === "VIDEO" ? ad.adUrl : getCloudinaryPreviewUrl(mediaImageUrl, ad.adUrl, mediaImageCorners)
        , [ad, mediaImageUrl, mediaImageCorners]);

    return (
        <Carousel.Slide>
            {loading && <Skeleton height={300} radius="md" />}
            <Box style={{ display: loading ? 'none' : 'block' }}>
                {ad.adType === "VIDEO" ? (
                    <video
                        src={url}
                        controls loop playsInline
                        style={{ width: '100%', borderRadius: '8px' }}
                        onLoadedData={() => setLoading(false)}
                    />
                ) : (
                    <Image src={url} alt="Ad preview" onLoad={() => setLoading(false)} />
                )}
            </Box>
        </Carousel.Slide>
    );
};

export function AdPreviewCarousel({ selectedCampaignAds, mediaImageUrl, mediaImageCorners }: AdPreviewCarouselProps) {
    return (
        <Carousel withIndicators={selectedCampaignAds.length > 1}>
            {selectedCampaignAds.map((ad, idx) => (
                <AdSlide
                    key={`${ad.adId}-${idx}`}
                    ad={ad}
                    mediaImageUrl={mediaImageUrl}
                    mediaImageCorners={mediaImageCorners}
                />
            ))}
        </Carousel>
    );
}