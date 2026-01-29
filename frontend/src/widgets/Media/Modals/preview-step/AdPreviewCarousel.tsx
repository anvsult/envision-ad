'use client'

import {Carousel} from "@mantine/carousel";
import {Image} from "@mantine/core";
import {useEffect, useState} from "react";

interface AdPreviewCarouselProps {
    selectedCampaignAdsImages: string[];
    mediaImageUrl: string;
    mediaImageCorners: string;
}

interface Corners {
    bl: { x: number; y: number };
    br: { x: number; y: number };
    tl: { x: number; y: number };
    tr: { x: number; y: number };
}

// Helper function to extract cloud name from Cloudinary URL
const extractCloudName = (url: string): string => {
    const match = url.match(/cloudinary\.com\/([^\/]+)\//);
    return match ? match[1] : '';
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url: string): string => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : '';
};

export function AdPreviewCarousel({selectedCampaignAdsImages, mediaImageUrl, mediaImageCorners}: AdPreviewCarouselProps) {
    const [mediaImageCornersExtracted, setMediaImageCornersExtracted] = useState<Corners | null>(null);
    const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([]);

    // Extract corners from JSON string
    useEffect(() => {
        try {
            const corners = JSON.parse(mediaImageCorners) as Corners;
            setMediaImageCornersExtracted(corners);
        } catch (error) {
            console.error('Failed to parse mediaImageCorners:', error);
        }
    }, [mediaImageCorners]);

    // Generate preview URLs with Cloudinary overlays
    useEffect(() => {
        if (!mediaImageCornersExtracted) return;

        const generateCloudinaryUrl = (baseUrl: string, overlayUrl: string, corners: Corners): string => {
            // Extract Cloudinary cloud name and public ID from the base URL
            const basePublicId = extractPublicId(baseUrl);
            const overlayPublicId = extractPublicId(overlayUrl);

            if (!basePublicId || !overlayPublicId) {
                console.error('Failed to extract public IDs');
                return baseUrl;
            }

            // Get image dimensions (you might need to fetch these or pass them as props)
            // For now, assuming we need to work with relative coordinates
            const cloudName = extractCloudName(baseUrl);

            // Cloudinary distort transformation uses absolute pixel coordinates
            // Format: l_<overlay>,e_distort:<tl_x>:<tl_y>:<tr_x>:<tr_y>:<br_x>:<br_y>:<bl_x>:<bl_y>,fl_layer_apply

            // Since we have relative coordinates, we need to convert them to a format Cloudinary understands
            // We'll use the relative flag with percentages
            const distortParams = `${corners.tl.x * 100}p:${corners.tl.y * 100}p:${corners.tr.x * 100}p:${corners.tr.y * 100}p:${corners.br.x * 100}p:${corners.br.y * 100}p:${corners.bl.x * 100}p:${corners.bl.y * 100}p`;

            return `https://res.cloudinary.com/${cloudName}/image/upload/l_${overlayPublicId.replace(/\//g, ':')}/e_distort:${distortParams},fl_layer_apply,fl_relative/${basePublicId}`;
        };

        const urls = selectedCampaignAdsImages.map(adImageUrl =>
            generateCloudinaryUrl(mediaImageUrl, adImageUrl, mediaImageCornersExtracted)
        );

        setPreviewImageUrls(urls);
    }, [mediaImageCornersExtracted, selectedCampaignAdsImages, mediaImageUrl]);

    return (
        <Carousel
            slideSize="70%"
            slideGap="md"
            controlsOffset="sm"
            controlSize={26}
            withControls
            withIndicators
        >
            {previewImageUrls.map((imageUrl, key) =>
                <Carousel.Slide key={key}>
                    <Image src={imageUrl} alt={`Ad preview ${key + 1}`} />
                </Carousel.Slide>
            )}
        </Carousel>
    )
}