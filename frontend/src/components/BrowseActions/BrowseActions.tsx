import { Group, Select, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

interface BrowseActionsProps{
    filters?: React.ReactNode;
    sort?: React.ReactNode;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
}

export default function BrowseActions({filters,  setSortBy}: BrowseActionsProps){
    const t = useTranslations('browse.browseactions');
    return(
        <Group justify="space-between">
            <Group>
                <Text>{t('filters.actionName')}</Text>
                {filters}
            </Group>
            <Group>
                <Text>{t('sort.actionName')}</Text>
                <Select
                    placeholder={t('nearest')}
                    data={
                        [
                            { value: "nearest", label: t('sort.nearest') },
                            { value: "price,asc", label: t('sort.priceAsc') },
                            { value: "price,desc", label: t('sort.priceDesc') },
                            { value: "dailyImpressions,asc", label: t('sort.impressionsAsc') },
                            { value: "dailyImpressions,desc", label: t('sort.impressionsDesc') },
                            { value: "loopDuration,asc", label: t('sort.loopAsc') },
                            { value: "loopDuration,desc", label: t('sort.loopDesc') },
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