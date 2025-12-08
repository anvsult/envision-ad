import { Group, Select, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FilterPricePopover, FilterPricePopoverProps } from "./Filters/FilterPopover";

export default function BrowseActions({minPrice, maxPrice, setMinPrice, setMaxPrice}: FilterPricePopoverProps){
    const t = useTranslations('browseactions');
    return(
        <Group justify="space-between">
            <Group>
                <Text>{t('filter')}</Text>
                <FilterPricePopover minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} setMaxPrice={setMaxPrice}/>
            </Group>
            <Group>
                <Text>{t('sort')}</Text>
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