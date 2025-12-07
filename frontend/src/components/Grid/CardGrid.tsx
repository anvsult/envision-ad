
import {  Grid, GridCol } from "@mantine/core";
import { Media } from "@/app/models/media";
import MediaCard from "../Cards/MediaCard";

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
    medias: Media[]; 
}

export function MediaCardGrid({medias}: MediaCardGridProps) {
    return(
        <div>
            <CardGrid>
                {medias.map((media) => (
                    <GridCol key={media.mediaId} span={{base: 12, xs: 5, sm: 4, md: 3, lg: 3, }}>
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
                            impressions={media.impressions}
                            dateAdded={media.dateAdded}
                        />
                    </GridCol>
              ))}
            </CardGrid>
        </div>
    )
}

export default CardGrid;