import { Carousel, CarouselSlide } from "@mantine/carousel";
import classes from "./CardCarousel.module.css";
import { Title } from "@mantine/core";
import MediaCard, { MediaCardProps } from "../Cards/MediaCard";
import { useEffect, useState } from "react";
import { getAllFilteredActiveMedia, SpecialSort } from "@/features/media-management/api/getAllFilteredActiveMedia";
import { FilteredActiveMediaProps, MediaStatus } from "@/entities/media/model/media";
import { useMediaList } from "@/features/media-management/api/useMediaList";

interface CardCarouselProps {
    title?: string;
    children?: React.ReactNode; 
}

function CardCarousel({title, children}: CardCarouselProps) {
    return(
        <div>
            {title ? <Title order={2}>{title}</Title>: <></>}
            <Carousel 
                classNames={classes}
                slideSize={{ base: '50%', sm: '33.33333%', md: '%'}}
                slideGap={{ base: 'sm', sm: 'md', md:'lg' }}
                emblaOptions={{ loop: true, align: 'center' }}
                
            >
                {children}
            </Carousel>
        </div>
    )
}

interface MediaCardCarouselProps {
    id?: string;
    title?: string;
    medias: MediaCardProps[]; 
}

export function MediaCardCarousel({id, title, medias}: MediaCardCarouselProps) {
    return(
        <div>
            <CardCarousel title={title}>
                {medias.map((media) => (
                    <MediaCard
                        key={id ? id + media.index : media.index}
                        index={id ? id + media.index : media.index}
                        href={media.href}
                        imageUrl={media.imageUrl}
                        title={media.title}
                        mediaOwnerName={media.mediaOwnerName}
                        mediaLocation={media.mediaLocation}
                        aspectRatio={media.aspectRatio}
                        typeOfDisplay={media.typeOfDisplay}
                        price={media.price} 
                        dailyImpressions={media.dailyImpressions}
                        resolution={media.resolution} 
                    />
              ))}
            </CardCarousel>
        </div>
    )
}

interface MediaCardCarouselLoaderProps {
    id?: string;
    title?: string;
    filteredMediaProps: FilteredActiveMediaProps;
}

export function MediaCardCarouselLoader({id, title, filteredMediaProps}: MediaCardCarouselLoaderProps){
    const medias = useMediaList({filteredMediaProps: filteredMediaProps});
    return(
        MediaCardCarousel({
            id: id, 
            title: title, 
            medias: medias
        })
    )
}

export default CardCarousel;