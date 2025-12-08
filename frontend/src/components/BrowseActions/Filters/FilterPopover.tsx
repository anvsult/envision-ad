import { Button, Group, NumberInput, Popover, PopoverDropdown, PopoverTarget, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export interface FilterPricePopoverProps{
    minPrice?: number|null;
    maxPrice?: number|null;
    setMinPrice: React.Dispatch<React.SetStateAction<number | null>>;
    setMaxPrice: React.Dispatch<React.SetStateAction<number | null>>;
}

interface FilterNumberInputProps{
    value?: number|null;
    setValue: React.Dispatch<React.SetStateAction<number | null>>;
    placeholder?: string;
    prefix?: string;
}

export function FilterNumberInput({value, setValue, placeholder, prefix}: FilterNumberInputProps){
    return(
        <Group gap='xs'>
            {prefix && <Text>{prefix}</Text>}
            <NumberInput
                placeholder={placeholder}
                decimalScale={2}
                hideControls 
                min={0}
                w={125}
                value={value ?? undefined}
                onChange={(v) => setValue(Number(v))}
            />
        </Group>
    )
}

export function FilterPricePopover({minPrice, maxPrice, setMinPrice, setMaxPrice}: FilterPricePopoverProps) {
    const t = useTranslations('filterprice');
    const [draftMin, setDraftMin] = useState<number | null>(minPrice ?? null);
    const [draftMax, setDraftMax] = useState<number | null>(maxPrice ?? null);
    // const [opened, setOpened] = useState(false);


    const handleApply = () => {
        setMinPrice(draftMin);
        setMaxPrice(draftMax);
        // setOpened(false);
    };

    return(
        <Popover trapFocus position="bottom" withArrow shadow="md" keepMounted>
            <PopoverTarget>
                <Button variant="transparent" rightSection={<IconChevronDown/>}>{t('price')}</Button>
            </PopoverTarget>
            <PopoverDropdown>
                <Group gap='lg'>
                    <FilterNumberInput
                        prefix="$"
                        placeholder={t('from')}
                        value={draftMin}
                        setValue={setDraftMin}
                    />
                    <FilterNumberInput
                        prefix="$"
                        placeholder={t('to')}
                        value={draftMax}
                        setValue={setDraftMax}
                    />
                </Group>
                <Group justify="flex-end" mt="md">
                    <Button size="xs" onClick={handleApply}>
                        {t("apply")}
                    </Button>
                </Group>
            </PopoverDropdown>
        </Popover>
    )
}