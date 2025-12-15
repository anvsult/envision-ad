import { SpecialSort } from "@/services/MediaService";
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
                    id="SortSelect"
                    data={
                        [
                            { value: SpecialSort.nearest, label: t('sort.nearest') },
                            { value: "price,asc", label: (t('sort.price') + t('sort.asc')) },
                            { value: "price,desc", label: (t('sort.price') + t('sort.desc')) },
                            { value: "dailyImpressions,asc", label: (t('sort.impressions') + t('sort.asc')) },
                            { value: "dailyImpressions,desc", label: (t('sort.impressions') + t('sort.desc')) },
                            { value: "loopDuration,asc", label: (t('sort.loop') + t('sort.asc')) },
                            { value: "loopDuration,desc", label: (t('sort.loop') + t('sort.desc')) },
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