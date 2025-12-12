import {
  Paper,
  Text,
  Image,
  Space,
  Anchor,
  AspectRatio,
  Stack,
  Group,
} from "@mantine/core";
import styles from "./MediaCard.module.css";
import { useTranslations } from "next-intl";
import StatusBadge from "../StatusBadge/StatusBadge";
import {MediaAdStatuses} from "@/entities/media";
// import { MediaAdStatuses } from "@//MediaAdStatus";

export interface MediaCardProps {
  id?: string;
  title: string;
  mediaOwnerName: string;
  address: string;
  resolution: string;
  aspectRatio: string;
  price: number;
  typeOfDisplay: string;
  imageUrl?: string | null;
  dailyImpressions: number;
  // TODO: Add `dateAdded: Date` property if/when date tracking is required.
}

export function MediaCard({
  id,
  imageUrl,
  title,
  mediaOwnerName,
  address,
  aspectRatio,
  resolution,
  typeOfDisplay,
  price,
  dailyImpressions,
}: MediaCardProps) {
  const t = useTranslations("mediacard");

  return (
    <Anchor href={"/medias/" + id} color="black" underline="never">
      <Paper shadow="sm" radius="md" mih="310px" className={styles.paper}>
        <AspectRatio ratio={16 / 9}>
          <Paper className={styles.imagecontainer} radius="md" shadow="xs">
             <StatusBadge status={MediaAdStatuses.DISPLAYING}/>
            <AspectRatio ratio={16 / 9}>
              <Image src={imageUrl} alt="Media" className={styles.image} />
            </AspectRatio>
          </Paper>
        </AspectRatio>
        <Stack gap="5px" p="10px">
          <Stack gap="2px">
            <Text size="md" lineClamp={3}>
              {title}
            </Text>
            <Text size="sm" color="gray" lineClamp={1}>
              {mediaOwnerName}
            </Text>
          </Stack>
          <Text size="lg" lineClamp={1}>
            {t("perWeek", { price: price })}
          </Text>
          <Stack gap="3px">
            <Text size="xs" lineClamp={1}>
              {address}
            </Text>
            <Text size="xs" lineClamp={1}>
              {t("dailyImpressions", { dailyImpressions: dailyImpressions })}
            </Text>
            <Group gap="auto">
              <Text size="xs" truncate>
                {aspectRatio}
              </Text>
              <Space w="lg" />
              <Text size="xs" truncate>
                {resolution}
              </Text>
              <Space w="lg" />
              <Text size="xs" truncate>
                {typeOfDisplay}
              </Text>
            </Group>
          </Stack>
        </Stack>
      </Paper>
    </Anchor>
  );
}

export default MediaCard;
