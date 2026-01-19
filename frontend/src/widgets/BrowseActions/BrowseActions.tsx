import { SpecialSort } from "@/features/media-management/api";
import { SortOptions } from "@/features/media-management/api/getAllFilteredActiveMedia";
import { Group, Select, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

interface BrowseActionsProps{
    filters?: React.ReactNode;
    sort?: React.ReactNode;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    sortSelectValue?: string;
}

export default function BrowseActions({filters,  setSortBy, sortSelectValue}: BrowseActionsProps){
    const t = useTranslations('browse.browseactions');
    const sortSelectData =[
        { value: SpecialSort.nearest, label: t('sort.nearest') },
        { value: SortOptions.priceAsc, label: (t('sort.price') + t('sort.asc')) },
        { value: SortOptions.priceDesc, label: (t('sort.price') + t('sort.desc')) },
        { value: SortOptions.dailyImpressionsAsc, label: (t('sort.impressions') + t('sort.asc')) },
        { value: SortOptions.dailyImpressionsDesc, label: (t('sort.impressions') + t('sort.desc')) },
        { value: SortOptions.loopDurationAsc, label: (t('sort.loop') + t('sort.asc')) },
        { value: SortOptions.loopDurationDesc, label: (t('sort.loop') + t('sort.desc')) },
    ];
    

    
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
                    data={sortSelectData}
                    value={sortSelectValue}
                    defaultValue={SpecialSort.nearest}
                    allowDeselect={false}
                    onOptionSubmit={setSortBy}
                />
            </Group>
        </Group>
    )
}