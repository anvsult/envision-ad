import { Paper, Text, Image, Anchor, AspectRatio, Stack, Group } from "@mantine/core";
import styles from "./MediaCard.module.css";
import { useLocale, useTranslations } from "next-intl";
import { getJoinedAddress } from "@/entities/media";
import { useMediaQuery } from "@mantine/hooks";
import {MediaLocation} from "@/entities/media-location";
import { formatCurrency } from "@/shared/lib/formatCurrency";

export interface MediaCardProps {
    index: string;
    href?: string;
    title: string;
    organizationId: string;
    organizationName: string;
    mediaLocation?: MediaLocation;
    resolution: string;
    aspectRatio: string;
    price: number;
    typeOfDisplay: string;
    imageUrl?: string | null;
    imageRatio?: number;
    dailyImpressions: number;
    mobileWidth?: string;
    
    // TODO: Add `dateAdded: Date` property if/when date tracking is required.
}

function MobileViewer({children, mobileWidth}: Readonly<{children: React.ReactNode; mobileWidth?: string}>){
    const isMobile = useMediaQuery(`(max-width: ${mobileWidth ?? "575px"})`);
    return(
        isMobile ? 
        <Group gap={0} wrap="nowrap">{children}</Group>:
        <Stack gap={0}>{children}</Stack>    
    )

}

function MediaCard({index, href, imageUrl, imageRatio, title, organizationName, mediaLocation, aspectRatio, resolution, typeOfDisplay, price, dailyImpressions, mobileWidth}: MediaCardProps) {
    const isMobile = useMediaQuery(`(max-width: ${mobileWidth ?? "575px"})`);
    
    const t = useTranslations("mediacard");
    const locale = useLocale();

    return (
        <Anchor href={"/medias/" + href} id={"MediaCard" + index} c="black" underline="never" 
            style={{scrollMarginTop: "25vh"}}
        >
            <Paper
                shadow="sm"
                radius="md"
                className={styles.paper}
                h="100%"
                
            >   
                <MobileViewer mobileWidth={mobileWidth}>
                    <AspectRatio ratio={imageRatio ?? 1} w={isMobile?"35%": "100%"} >
                        <Paper className={styles.imagecontainer} radius="md" shadow="xs" >
                            {/* <StatusBadge status={MediaAdStatuses.DISPLAYING}/> */}
                            <AspectRatio ratio={imageRatio ?? 1}>
                                <Image src={imageUrl} alt="Media"  className={styles.image}  fit="cover" />
                            </AspectRatio>
                        </Paper>
                    </AspectRatio>
                    <Stack gap="3px" p={isMobile? 0 :"10px"} px={isMobile ? "4px": "10px"}>
                        <Stack gap="2px">
                            <Text id={"MediaCardTitle" + index} size="md" lineClamp={3} className={styles.mediaTitle} m={0} truncate>
                                {title}
                            </Text>
                            <Text id={"MediaCardOrganizationName" + index} size="sm" c="gray" lineClamp={1} m={0}>
                                {organizationName}
                            </Text>
                            <Text id={"MediaCardPrice" + index} size="lg" lineClamp={1}>
                                {t('perWeek', { price: formatCurrency(price, { locale }) })}
                            </Text>
                            
                            
                            {mediaLocation && 
                            <Text id={"MediaCardAddress" + index} size="xs" lineClamp={1} m={0}>
                                {getJoinedAddress([mediaLocation.city, mediaLocation.province])}
                            </Text>
                            }
                            
                            <Text id={"MediaCardImpressions" + index} size="xs" lineClamp={1} m={0}>
                                {t('dailyImpressions', {dailyImpressions: dailyImpressions})}
                            </Text>
                            
                            <Group justify="space-between">
                                <Text id={"MediaCardAspectRatio" + index} size="xs" m={0}>
                                    {aspectRatio}
                                </Text>
                                <Text id={"MediaCardResolution" + index} size="xs" m={0}>
                                    {resolution} 
                                </Text>
                                <Text id={"MediaCardType" + index} size="xs" m={0}>
                                    {typeOfDisplay}
                                </Text>
                            </Group>
                            
                        </Stack>
                    </Stack>
                </MobileViewer>
            </Paper>
        </Anchor>
    )
}

export default MediaCard;
