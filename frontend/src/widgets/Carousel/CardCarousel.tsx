import { Carousel } from "@mantine/carousel";
import classes from "./CardCarousel.module.css";
import { Title } from "@mantine/core";
import MediaCard, { MediaCardProps } from "../Cards/MediaCard";
import { FilteredActiveMediaProps } from "@/entities/media/model/media";
import { useMediaList } from "@/features/media-management/api/useMediaList";
import '@mantine/carousel/styles.css';

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
                mih={310}
                slideSize={{ base: '100%', sm: '50%', md: '25%' }}
                slideGap={{ base: 0, sm: 'md' }}
                emblaOptions={{ loop: true, align: 'start', dragFree: true}}
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
        (medias.length > 0 &&
            <CardCarousel title={title} >
                {medias.map((media) => (
                    <Carousel.Slide key={id ? id + media.index : media.index}>
                        <MediaCard
                            index={id ? id + media.index : media.index}
                            href={media.href}
                            imageUrl={media.imageUrl}
                            title={media.title}
                            organizationId={media.organizationId}
                            mediaLocation={media.mediaLocation}
                            aspectRatio={media.aspectRatio}
                            typeOfDisplay={media.typeOfDisplay}
                            price={media.price} 
                            dailyImpressions={media.dailyImpressions}
                            resolution={media.resolution} 
                        />
                    </Carousel.Slide>
                ))}
            </CardCarousel>
        )
    )
}

interface MediaCardCarouselLoaderProps {
    id?: string;
    title?: string;
    filteredMediaProps: FilteredActiveMediaProps;
}

export function MediaCardCarouselLoader({id, title, filteredMediaProps}: MediaCardCarouselLoaderProps){
    const medias = useMediaList({filteredMediaProps});
    return(
        MediaCardCarousel({
            id: id, 
            title: title, 
            medias: medias
        })
    )
}

export default CardCarousel;