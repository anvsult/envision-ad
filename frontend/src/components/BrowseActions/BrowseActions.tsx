import { Group, Select, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FilterPricePopover, FilterPricePopoverProps } from "./Filters/FilterPopover";

interface BrowseActionsProps{
    filters?: React.ReactNode;
    sort?: React.ReactNode;
}

export default function BrowseActions({filters, sort}: BrowseActionsProps){
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
                    data={['Nearest', 'Price: Low to high', 'Price: High to low', 'Recently added']}
                    defaultValue="Nearest"
                    allowDeselect={false}
                />
            </Group>
        </Group>
    )
}