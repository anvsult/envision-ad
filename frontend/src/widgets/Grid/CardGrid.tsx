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
    size: number
}

export function MediaCardGrid({id, medias, size}: MediaCardGridProps) {
    return(
        <div >
            <CardGrid>
                {medias.map((media) => (
                    <GridCol key={id ? `${id}-${media.index}` : media.index} span={{base: 12 , xs: 6 * size, sm: 3 * size, md: 3 * size, lg: 3 * size}}>
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
                            /* TODO: Add dateAdded props when supported by MediaCard */
                        />
                    </GridCol>
              ))}
            </CardGrid>
        </div>
    )
}

export default CardGrid;