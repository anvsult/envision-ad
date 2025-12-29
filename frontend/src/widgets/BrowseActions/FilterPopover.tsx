import { Button, Group, NumberInput, Popover, PopoverDropdown, PopoverTarget, Stack, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";



interface FilterNumberInputProps{
    value?: number|null;
    setValue: React.Dispatch<React.SetStateAction<number | null>>;
    label: string;
    placeholder?: string;
    prefix?: string;
    w?: number;
}

export function FilterNumberInput({value, setValue, label, placeholder, prefix, w}: FilterNumberInputProps){
    return(
        <Stack gap="xs">
            <Text size="sm">{label}</Text>
            <Group gap='xs'>
                {prefix && <Text>{prefix}</Text>}
                <NumberInput
                    placeholder={placeholder}
                    decimalScale={2}
                    hideControls 
                    min={0}
                    w={w}
                    value={value ?? undefined}
                    onChange={(v) => setValue(v === "" || v === null || v === undefined ? null : Number(v))}
                />
            </Group>
        </Stack>
    )
}

interface FilterPopoverProps {
    buttonName: string;
    applyActions: ()=> void;
    children?: React.ReactNode;
}

function FilterPopover({buttonName, applyActions, children}: FilterPopoverProps){
    const t = useTranslations('browse.browseactions.filters');
    const [opened, setOpened] = useState(false);
    
    const handleApply = useCallback(() => {
        applyActions();
        setOpened(false);
    }, [applyActions]);

    function toggleOpen() {
        setOpened(!opened)
    }
    
    useEffect(() => {
        if (!opened) return;

        const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            handleApply();
        }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [opened, handleApply]);
  
    return(
        <Popover opened={opened} onChange={setOpened} trapFocus position="bottom" withArrow shadow="md" keepMounted >
            <PopoverTarget>
                <Button onClick={toggleOpen} variant="transparent" rightSection={<IconChevronDown/>}>{buttonName}</Button>
            </PopoverTarget>
            <PopoverDropdown>
                {children}
                <Group justify="flex-end" mt="md">
                <Button size="xs" onClick={handleApply}>
                    {t("showresults")}
                </Button>
            </Group>
            </PopoverDropdown>
            
        </Popover>
    )
}

export interface FilterPricePopoverProps{
    minPrice?: number|null;
    maxPrice?: number|null;
    setMinPrice: React.Dispatch<React.SetStateAction<number | null>>;
    setMaxPrice: React.Dispatch<React.SetStateAction<number | null>>;
}

export function FilterPricePopover({minPrice, maxPrice, setMinPrice, setMaxPrice}: FilterPricePopoverProps) {
    const t = useTranslations('browse.browseactions.filters');
    const [draftMin, setDraftMin] = useState<number | null>(minPrice ?? null);
    const [draftMax, setDraftMax] = useState<number | null>(maxPrice ?? null);
    

    function handleApply() {
        setMinPrice(draftMin);
        setMaxPrice(draftMax);
    };

    return(
        <FilterPopover buttonName={t('price')} applyActions={handleApply}>
            <Group gap='lg'>
                <FilterNumberInput
                    label={t('from')}
                    prefix="$"
                    placeholder={t('from')}
                    w={125}
                    value={draftMin}
                    setValue={setDraftMin}
                />
                <FilterNumberInput
                    label={t('to')}
                    prefix="$"
                    placeholder={t('to')}
                    w={125}
                    value={draftMax}
                    setValue={setDraftMax}
                />
            </Group>
        </FilterPopover>
    )
}

export function FilterValuePopover({value, setValue, label, placeholder, prefix}: FilterNumberInputProps) {
    const [draftValue, setdraftValue] = useState<number | null>(value ?? null);
    

    function handleApply() {
        setValue(draftValue);
    };

    return(
        <FilterPopover buttonName={label} applyActions={handleApply}>
            <Group gap='lg'>
                <FilterNumberInput
                    label={label}
                    prefix={prefix}
                    placeholder={placeholder}
                    value={draftValue}
                    setValue={setdraftValue}
                />
            </Group>
        </FilterPopover>
    )
}