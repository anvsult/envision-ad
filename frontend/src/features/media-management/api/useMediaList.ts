import { UseMediaListProps } from "@/entities/media/model/media";
import { MediaCardProps } from "@/widgets/Cards/MediaCard";
import { useEffect, useState } from "react";
import { getAllFilteredActiveMedia, SpecialSort } from ".";


export function useMediaList({
    filteredMediaProps, 
    loadingLocation,
    setMediaStatus
}: UseMediaListProps
) {
    const [medias, setMedias] = useState<MediaCardProps[]>([]);
    
    useEffect(() => {
        if (filteredMediaProps.sort === SpecialSort.nearest && loadingLocation) {
            return;
        }
        
        let cancelled = false;

        async function loadMedia() {
            setMediaStatus?.("loading");

            try {
                const data = await getAllFilteredActiveMedia(filteredMediaProps);

                if (cancelled) return;

                const items = (data.content || [])
                    .filter((m) => m.id != null)
                    .map((m, index) => ({
                    index: String(index),
                    href: String(m.id),
                    title: m.title,
                    mediaOwnerName: m.mediaOwnerName,
                    mediaLocation: m.mediaLocation,
                    resolution: m.resolution,
                    aspectRatio: m.aspectRatio,
                    price: m.price ?? 0,
                    dailyImpressions: m.dailyImpressions ?? 0,
                    typeOfDisplay: m.typeOfDisplay,
                    imageUrl: m.imageUrl
                    }));

                setMedias(items);

                setMediaStatus?.('success');
                } catch {
                    if (!cancelled) {
                        setMediaStatus?.('error');
                    }
                }
        }

        loadMedia();

        return () => {
            cancelled = true;
        };
    },[filteredMediaProps, loadingLocation, setMediaStatus]);

    return medias;
    
}