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
    medias: MediaCardProps[]; 
}

export function MediaCardGrid({medias}: MediaCardGridProps) {
    return(
        <div>
            <CardGrid>
                {medias.map((media) => (
                    <GridCol key={media.id} span={{base: 12, xs: 5, sm: 4, md: 3, lg: 3 }}>
                        <MediaCard 
                            id={media.id}
                            imageUrl={media.imageUrl}
                            title={media.title}
                            mediaOwnerName={media.mediaOwnerName}
                            address={media.address}
                            aspectRatio={media.aspectRatio}
                            width={media.width}
                            height={media.height}
                            typeOfDisplay={media.typeOfDisplay}
                            price={media.price} 
                            dailyImpressions={media.dailyImpressions} 
                            resolution={media.resolution} 
                            loopDuration={media.loopDuration}
                            {/* TODO: Add impressions and dateAdded props when supported by MediaCard */}
                        />
                    </GridCol>
              ))}
            </CardGrid>
        </div>
    )
}

export default CardGrid;