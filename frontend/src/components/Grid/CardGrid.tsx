import { Grid, GridCol } from "@mantine/core";
import MediaCard, { MediaCardProps } from "../Cards/MediaCard";

interface CardGridProps {
    children?: React.ReactNode; 
}

function CardGrid({children}: CardGridProps) {
    return(
        <div>
            <Grid >
                {children}
            </Grid>
        </div>
    )
}

interface MediaCardGridProps {
    id?: string;
    medias: MediaCardProps[]; 
}

export function MediaCardGrid({id, medias}: MediaCardGridProps) {
    return(
        <div>
            <CardGrid>
                {medias.map((media) => (
                    <GridCol key={id ? `${id}-${media.index}` : media.index} span={{base: 12, xs: 5, sm: 4, md: 3, lg: 3 }}>
                        <MediaCard 
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
                            /* TODO: Add dateAdded props when supported by MediaCard */
                        />
                    </GridCol>
              ))}
            </CardGrid>
        </div>
    )
}

export default CardGrid;