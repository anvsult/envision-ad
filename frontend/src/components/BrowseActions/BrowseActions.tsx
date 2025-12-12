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