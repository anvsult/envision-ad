import { Carousel, CarouselSlide } from "@mantine/carousel";
import classes from "./CardCarousel.module.css";
import { Title } from "@mantine/core";
import MediaCard, { MediaCardProps } from "../Cards/MediaCard";

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
                slideSize={{ base: '50%', sm: '33.33333%', md: '20%'}}
                slideGap={{ base: 'sm', sm: 'md' }}
                emblaOptions={{ loop: true, align: 'center' }}
                
            >
                {children}
            </Carousel>
        </div>
    )
}

interface MediaCardCarouselProps {
    title?: string;
    medias: MediaCardProps[]; 
}

export function MediaCardCarousel({title, medias}: MediaCardCarouselProps) {
    return(
        <div>
            <CardCarousel title={title}>
                {medias.map((media) => (
                <CarouselSlide key={media.id} py="sm">
                    <MediaCard
                        id={media.id}
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
                </CarouselSlide>
              ))}
            </CardCarousel>
        </div>
    )
}

export default CardCarousel;