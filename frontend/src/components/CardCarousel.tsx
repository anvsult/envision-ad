import { Carousel, CarouselSlide } from "@mantine/carousel";
import classes from "./CardCarousel.module.css"
import { Space, Title } from "@mantine/core";
import { Media } from "@/app/models/media";
import MediaCard from "./MediaCard";

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
                slideSize={{ base: '50%', sm: '33.33333%', md: '25%'}}
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
    medias: Media[]; 
}

export function MediaCardCarousel({title, medias}: MediaCardCarouselProps) {
    return(
        <div>
            <CardCarousel title={title}>
                {medias.map((media) => (
                <CarouselSlide key={media.mediaId} >
                  <MediaCard
                    mediaId={media.mediaId}
                    image={media.image} 
                    title={media.title} 
                    mediaOwner={media.mediaOwner} 
                    address={media.address} 
                    ratio={media.ratio} 
                    width={media.width} 
                    height={media.height} 
                    type={media.type} 
                    price={media.price} 
                    passerbys={media.passerbys}/>
                </CarouselSlide>
              ))}
            </CardCarousel>
        </div>
    )
}

export default CardCarousel;