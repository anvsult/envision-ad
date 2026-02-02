import { Paper, Text, Image, Anchor, AspectRatio, Stack, Group } from "@mantine/core";
import styles from "./MediaCard.module.css";
import {useLocale, useTranslations} from "next-intl";
import { getJoinedAddress, MediaLocation } from "@/entities/media";
import { useEffect, useState } from "react";
import { getOrganizationById } from "@/features/organization-management/api";
import { useMediaQuery } from "@mantine/hooks";

export interface MediaCardProps {
    index: string;
    href?: string;
    title: string;
    organizationId: string;
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



function MobileViewer({children}: Readonly<{children: React.ReactNode;}>){
    const isMobile = useMediaQuery("(max-width: 575px)");
    return(
            isMobile ? 
            <Group gap={0} wrap="nowrap">{children}</Group>:
            <Stack gap={0}>{children}</Stack>    
    )

}

function MediaCard({index, href, imageUrl, title, organizationId, mediaLocation, aspectRatio, resolution, typeOfDisplay, price, dailyImpressions}: MediaCardProps) {
    const isMobile = useMediaQuery("(max-width: 575px)");
    
    const t = useTranslations("mediacard");
    const [organizationName, setOrganizationName] = useState<string>("");
    const locale = useLocale();

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'CAD',
        }).format(amount);
    };

    useEffect(() => {
        if (!organizationId){
        return
        }
        const fetchOrganizationDetails = async (organizationId: string) => {
        try {

            const response = await getOrganizationById(organizationId);
            setOrganizationName(response.name);
        } catch (e){
            console.log(e)
        }
        };
        
        fetchOrganizationDetails(organizationId)
    }, [organizationId]);

    

    return (
        <Anchor href={"/medias/" + href} id={"MediaCard" + index} color="black" underline="never"
            style={{scrollMarginTop: "2vh"}}
        
        >
            <Paper 
                shadow="sm"
                radius="md"
                className={styles.paper}
                h="100%"
            >   
                <MobileViewer >
                    <AspectRatio ratio={ratio} w={isMobile?"35%": "100%"} >
                        <Paper className={styles.imagecontainer} radius="md" shadow="xs" >
                            {/* <StatusBadge status={MediaAdStatuses.DISPLAYING}/> */}
                            <AspectRatio ratio={ratio}>
                                <Image src={imageUrl} alt="Media"  className={styles.image}  fit="cover" />
                            </AspectRatio>
                        </Paper>
                    </AspectRatio>
                    <Stack gap="5px" p="10px">
                        <Stack gap="2px">
                            <Text id={"MediaCardTitle" + index} size="md" lineClamp={3} className={styles.mediaTitle} >
                                {title}
                            </Text>
                            <Text id={"MediaCardOwnerName" + index} size="sm" color="gray" lineClamp={1}>
                                {organizationName}
                            </Text>
                            
                            
                        </Stack>
                        <Text id={"MediaCardPrice" + index} size="lg" lineClamp={1}>
                                    {t('perWeek', {price: formatCurrency(price)})}
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
                </MobileViewer>
            </Paper>
        </Anchor>
    )
}

export default MediaCard;