import {
    Paper,
    Text,
    Image,
    Anchor,
    AspectRatio,
    Stack,
    Group,
    Divider,
    Badge,
    Box,
} from "@mantine/core";
import styles from "./MediaCard.module.css";
import { useLocale, useTranslations } from "next-intl";
import { getJoinedAddress, MonthlyScheduleModel } from "@/entities/media";
import { useMediaQuery } from "@mantine/hooks";
import { MediaLocation } from "@/entities/media-location";
import { formatCurrency } from "@/shared/lib/formatCurrency";
import calculateWeeklyImpressions from "@/features/media-management/api/calculateWeeklyImpressions";
import { ImgNotFound } from "../imageNotFound";
import { IconEye } from "@tabler/icons-react";

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
    schedule: MonthlyScheduleModel;
    mobileWidth?: string;
}

function MediaCard({
                       index,
                       href,
                       imageUrl,
                       title,
                       organizationName,
                       mediaLocation,
                       aspectRatio,
                       resolution,
                       typeOfDisplay,
                       price,
                       dailyImpressions,
                       schedule,
                       mobileWidth,
                   }: MediaCardProps) {
    const mobileBreakpoint = mobileWidth ?? "575px";
    const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint})`);
    const isXsMobile = useMediaQuery(`(max-width: 420px)`);

    const t = useTranslations("mediacard");
    const t2 = useTranslations("mediaPage");
    const locale = useLocale();

    const weeklyImpressions = calculateWeeklyImpressions(
        dailyImpressions,
        schedule.weeklySchedule ?? []
    );

    const locationText = mediaLocation
        ? getJoinedAddress([mediaLocation.city, mediaLocation.province])
        : null;

    let translatedTypeOfDisplay: string;
    try {
        translatedTypeOfDisplay = t(`typeOfDisplay.${typeOfDisplay}`);
    } catch {
        translatedTypeOfDisplay = typeOfDisplay;
    }

    const imageBlock = (
        <AspectRatio
            ratio={1}
            w={isMobile && !isXsMobile ? 170 : "100%"}
            miw={isMobile && !isXsMobile ? 132 : undefined}
        >
            <Paper className={styles.imagecontainer} radius="md" shadow="xs">
                <AspectRatio ratio={1}>
                    <Image
                        src={imageUrl}
                        alt={title}
                        className={styles.image}
                        fit="cover"
                        fallbackSrc={ImgNotFound(t2("imageNotFound"))}
                    />
                </AspectRatio>
            </Paper>
        </AspectRatio>
    );

    const contentBlock = (
        <Stack
            gap="10px"
            p={isMobile ? 0 : "10px"}
            px={isMobile ? 0 : "10px"}
            style={{ flex: 1, minWidth: 0 }}
        >
            <Stack gap="4px">
                <Text
                    id={"MediaCardOrganizationName" + index}
                    size={isXsMobile ? "xs" : "sm"}
                    c="dimmed"
                    lineClamp={1}
                    m={0}
                >
                    {organizationName}
                </Text>

                <Text
                    id={"MediaCardTitle" + index}
                    size={isXsMobile ? "md" : isMobile ? "md" : "lg"}
                    fw={600}
                    lineClamp={2}
                    className={styles.mediaTitle}
                    m={0}
                >
                    {title}
                </Text>

                <Group gap={6} wrap="nowrap" align="center">
                    <IconEye size={15} stroke={1.8} />
                    <Text
                        id={"MediaCardImpressions" + index}
                        size={isXsMobile ? "xs" : "sm"}
                        fw={500}
                        lineClamp={1}
                        m={0}
                    >
                        {t("weeklyImpressions", { weeklyImpressions })}
                    </Text>
                </Group>

                {locationText && (
                    <Text
                        id={"MediaCardAddress" + index}
                        size={isXsMobile ? "xs" : "sm"}
                        c="dimmed"
                        lineClamp={1}
                        m={0}
                    >
                        {"\u{1F4CD}"} {locationText}
                    </Text>
                )}
            </Stack>

            <Divider />

            <Stack gap="8px">
                <Box>
                    <Text
                        id={"MediaCardPrice" + index}
                        size={isXsMobile ? "xl" : isMobile ? "xl" : "xl"}
                        fw={800}
                        c="blue.7"
                        m={0}
                        style={{ lineHeight: 1.1 }}
                    >
                        {t("perWeek", {
                            price: formatCurrency(price, { locale }),
                        })}
                    </Text>
                </Box>

                <Group gap="xs" wrap="wrap">
                    <Badge size="xs" variant="outline" color="gray">
                        {aspectRatio}
                    </Badge>
                    <Badge size="xs" variant="outline" color="gray">
                        {resolution}
                    </Badge>
                    <Badge size="xs" variant="outline" color="gray">
                        {translatedTypeOfDisplay}
                    </Badge>
                </Group>
            </Stack>
        </Stack>
    );

    return (
        <Anchor
            href={"/medias/" + href}
            id={"MediaCard" + index}
            c="black"
            underline="never"
            aria-label={`View Details for ${title}`}
            style={{ scrollMarginTop: "25vh", display: "block", height: "100%" }}
        >
            <Paper
                shadow="sm"
                radius="md"
                className={styles.paper}
                h="100%"
                p={isXsMobile ? "12px" : "14px"}
            >
                {isMobile ? (
                    isXsMobile ? (
                        <Stack gap="12px">
                            {imageBlock}
                            {contentBlock}
                        </Stack>
                    ) : (
                        <Group gap="12px" wrap="nowrap" align="flex-start">
                            {imageBlock}
                            {contentBlock}
                        </Group>
                    )
                ) : (
                    <Stack gap={0}>
                        {imageBlock}
                        {contentBlock}
                    </Stack>
                )}
            </Paper>
        </Anchor>
    );
}

export default MediaCard;