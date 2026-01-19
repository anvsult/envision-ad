import { Paper, Text, Image, Anchor, AspectRatio, Stack, Group } from "@mantine/core";
import styles from "./MediaCard.module.css";
import { useTranslations } from "next-intl";
import { getJoinedAddress, MediaLocation } from "@/entities/media";

export interface MediaCardProps {
    index: string;
    href?: string;
    title: string;
    mediaOwnerName: string;
    mediaLocation: MediaLocation;
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
    // const isMobile = useMediaQuery("(max-width: 768px)");
    const t = useTranslations("mediacard");

    return (
        <Anchor href={"/medias/" + href} id={"MediaCard" + index} color="black" underline="never" >
            <Paper 
                shadow="sm"
                radius="md"
                className={styles.paper}
                h="100%"
            >   
                <Stack gap={0} >
                    <AspectRatio ratio={ratio}>
                        <Paper className={styles.imagecontainer} radius="md" shadow="xs" >
                            {/* <StatusBadge status={MediaAdStatuses.DISPLAYING}/> */}
                            <AspectRatio ratio={ratio}>
                                <Image src={imageUrl} alt="Media"  className={styles.image}  fit="cover" />
                            </AspectRatio>
                        </Paper>
                    </AspectRatio>
                    <Stack gap="5px" p="10px">
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
                            <Group justify="space-between">
                                <Text id={"MediaCardAspectRatio" + index} size="xs" >
                                    {aspectRatio}
                                </Text>
                                <Text id={"MediaCardResolution" + index} size="xs" >
                                    {resolution} 
                                </Text>
                                <Text id={"MediaCardType" + index} size="xs" >
                                    {typeOfDisplay}
                                </Text>
                            </Group>
                        </Stack>
                    </Stack>
                </Stack>
            </Paper>
        </Anchor>
    )
}

export default MediaCard;