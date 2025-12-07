import { Paper, Text, Image, Space, Anchor, Badge } from "@mantine/core";
import styles from "./MediaCard.module.css";
import { Media } from "@/app/models/media";
import { useTranslations } from "next-intl";
import StatusBadge from "../StatusBadge/StatusBadge";
import { MediaStatuses } from "@/app/models/mediaStatuses";

function MediaCard({image, title, mediaOwner, address, ratio, width, height, type, price, impressions}: Media) {
    const t = useTranslations("mediacard");
    
    return (
        <Anchor href="/browse" color="black.1" underline="never">
            <Paper 
                shadow="sm"
                radius="md"
                className={styles.paper}
            >   
                <Paper className={styles.imagecontainer} radius="md" >
                    <StatusBadge status={MediaStatuses.DISPLAYING}/>
                    <Image src={image} alt="Media"  className={styles.image}/>
                </Paper>
                <div className={styles.details} >
                    <Text size="md" lineClamp={3}>
                        {title}
                    </Text>
                    <Text size="sm" lineClamp={1}>
                        {mediaOwner}
                    </Text>
                    <Text size="md" lineClamp={1}>
                            {t('perWeek', {price: price})}
                    </Text>
                    <Text size="xs" lineClamp={1} >
                        {t('dailyImpressions', {impressions: impressions})}
                    </Text>
                    <Text size="xs" lineClamp={1}>
                        {address}
                    </Text>
                    
                    <div className={styles.info}>    
                        <Text size="xs" span truncate>
                            {ratio}
                        </Text>
                        <Space w="lg" />
                        <Text size="xs" span truncate>
                            {width}x{height} 
                        </Text>
                        <Space w="lg" />
                        <Text size="xs" span truncate>
                            {type}
                        </Text>
                        
                        
                    </div>
                </div>
            </Paper>
        </Anchor>
    )
}

export default MediaCard;