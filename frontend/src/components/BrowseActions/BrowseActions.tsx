import { Group, Select, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

interface BrowseActionsProps{
    filters?: React.ReactNode;
    sort?: React.ReactNode;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
}

export default function BrowseActions({filters, sort, setSortBy}: BrowseActionsProps){
    const t = useTranslations('browse.browseactions');
    return(
        <Group justify="space-between">
            <Group>
                <Text>{t('filter')}</Text>
                {filters}
            </Group>
            <Group>
                <Text>{t('sort')}</Text>
                {sort}
                <Select
                    placeholder="Nearest"
                    data={
                        [
                            { value: "nearest", label: t('nearest') },
                            { value: "price,asc", label: "Price (Low to High)" },
                            { value: "price,desc", label: "Price (High to Low)" },
                            { value: "dailyImpressions,asc", label: "Impressions (Low to High)" },
                            { value: "dailyImpressions,desc", label: "Impressions (High to Low)" },
                            { value: "loopDuration,asc", label: "Loop duration (High to Low)" },
                            { value: "loopDuration,desc", label: "Loop duration (High to Low)" },
                        ]
                    }
                    defaultValue="nearest"
                    allowDeselect={false}
                    onOptionSubmit={setSortBy}
                />
            </Group>
        </Group>
    )
}