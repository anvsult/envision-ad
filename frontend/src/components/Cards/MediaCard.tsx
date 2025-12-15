import { Paper, Text, Image, Space, Anchor, AspectRatio, Stack, Group } from "@mantine/core";
import styles from "./MediaCard.module.css";
import { useTranslations } from "next-intl";
import { getJoinedAddress, MediaLocationDTO } from "@/types/MediaTypes";
// import StatusBadge from "../StatusBadge/StatusBadge";
// import { MediaAdStatuses } from "@/types/MediaAdStatus";

export interface MediaCardProps {
    index: string;
    href?: string;
    title: string;
    mediaOwnerName: string;
    mediaLocation: MediaLocationDTO;
    resolution: string;
    aspectRatio: string;
    price: number ;
    typeOfDisplay: string;
    imageUrl?: string | null;
    dailyImpressions: number
    // TODO: Add `dateAdded: Date` property if/when date tracking is required.
}

const ratio = 1/1

function MediaCard({index, href, imageUrl, title, mediaOwnerName, mediaLocation, aspectRatio, resolution, typeOfDisplay, price, dailyImpressions}: MediaCardProps) {
    const t = useTranslations("mediacard");
    
    return (
        <Anchor href={"/medias/" + href} id={"MediaCard" + index} color="black" underline="never">
            <Paper 
                shadow="sm"
                radius="md"
                mih="310px"
                className={styles.paper}
            >   
                <AspectRatio ratio={ratio}>
                    <Paper className={styles.imagecontainer} radius="md" shadow="xs">
                        {/* <StatusBadge status={MediaAdStatuses.DISPLAYING}/> */}
                        <AspectRatio ratio={ratio}>
                            <Image src={imageUrl} alt="Media"  className={styles.image}/>
                        </AspectRatio>
                    </Paper>
                </AspectRatio>
                <Stack gap="5px" p="10px" >
                    <Stack gap="2px">
                        <Text id={"MediaCardTitle" + index} size="md" lineClamp={3} >
                            {title}
                        </Text>
                        <Text id={"MediaCardOwnerName" + index} size="sm" color="gray" lineClamp={1}>
                            {mediaOwnerName}
                        </Text>
                        
                        
                    </Stack>
                    <Text id={"MediaCardPrice" + index} size="lg" lineClamp={1}>
                                {t('perWeek', {price: price})}
                        </Text>
                    <Stack gap="3px">
                        <Text id={"MediaCardAddress" + index} size="xs" lineClamp={1}>
                            {getJoinedAddress([mediaLocation.city, mediaLocation.province])}
                        </Text>
                        <Text id={"MediaCardImpressions" + index} size="xs" lineClamp={1} >
                            {t('dailyImpressions', {dailyImpressions: dailyImpressions})}
                        </Text>
                        <Group gap="auto">
                            <Text id={"MediaCardAspectRatio" + index} size="xs" truncate>
                                {aspectRatio}
                            </Text>
                            <Space w="lg" />
                            <Text id={"MediaCardResolution" + index} size="xs" truncate>
                                {resolution} 
                            </Text>
                            <Space w="lg" />
                            <Text id={"MediaCardType" + index} size="xs" truncate>
                                {typeOfDisplay}
                            </Text>
                        </Group>
                    </Stack>
                </Stack>
            </Paper>
        </Anchor>
    )
}

export default MediaCard;