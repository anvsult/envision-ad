import { Paper, Text, Image, Space, Anchor, AspectRatio } from "@mantine/core";
import styles from "./MediaCard.module.css";
import { useTranslations } from "next-intl";
import StatusBadge from "../StatusBadge/StatusBadge";
import { MediaStatuses } from "@/app/models/mediaStatuses";

export interface MediaCardProps {
    id?: string;
    title: string;
    mediaOwnerName: string;
    address: string;
    resolution: string;
    aspectRatio: string;
    loopDuration: number | null;
    width: number | null;
    height: number | null;
    price: number ;
    typeOfDisplay: string;
    imageUrl?: string | null;
    dailyImpressions: number ,
    // dateAdded: Date
}

function MediaCard({imageUrl, title, mediaOwnerName, address, aspectRatio, resolution, typeOfDisplay, price, dailyImpressions}: MediaCardProps) {
    const t = useTranslations("mediacard");
    
    return (
        <Anchor href="/browse" color="black.1" underline="never">
            <Paper 
                shadow="sm"
                radius="md"
                mih="280px"
                className={styles.paper}
            >   
                <AspectRatio ratio={16/9}>
                    <Paper className={styles.imagecontainer} radius="md" >
                        <StatusBadge status={MediaStatuses.DISPLAYING}/>
                        <AspectRatio ratio={16/9}>
                            <Image src={imageUrl} alt="Media"  className={styles.image}/>
                        </AspectRatio>
                    </Paper>
                </AspectRatio>
                <div className={styles.details} >
                    <Text size="md" lineClamp={3}>
                        {title}
                    </Text>
                    <Text size="sm" lineClamp={1}>
                        {mediaOwnerName}
                    </Text>
                    <Text size="md" lineClamp={1}>
                            {t('perWeek', {price: price})}
                    </Text>
                    <Text size="xs" lineClamp={1} >
                        {t('dailyImpressions', {dailyImpressions: dailyImpressions})}
                    </Text>
                    <Text size="xs" lineClamp={1}>
                        {address}
                    </Text>
                    
                    <div className={styles.info}>    
                        <Text size="xs" span truncate>
                            {aspectRatio}
                        </Text>
                        <Space w="lg" />
                        <Text size="xs" span truncate>
                            {resolution} 
                        </Text>
                        <Space w="lg" />
                        <Text size="xs" span truncate>
                            {typeOfDisplay}
                        </Text>
                        
                        
                    </div>
                </div>
            </Paper>
        </Anchor>
    )
}

export default MediaCard;