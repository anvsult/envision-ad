import React, { useEffect } from "react";
import { useForm } from "@mantine/form";
import { Modal, TextInput, NumberInput, Group, Button, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";
import { MediaLocation, MediaLocationRequestDTO } from "@/entities/media-location/model/mediaLocation";
import { updateMediaLocation } from "@/features/media-location-management/api";
import { notifications } from "@mantine/notifications";

interface EditMediaLocationModalProps {
    opened: boolean;
    onClose: () => void;
    location: MediaLocation | null;
    onSuccess: () => void;
}

export function EditMediaLocationModal({ opened, onClose, location, onSuccess }: EditMediaLocationModalProps) {
    const t = useTranslations("mediaLocations.modals.edit");

    const form = useForm<MediaLocationRequestDTO>({
        initialValues: {
            name: "",
            street: "",
            city: "",
            province: "",
            country: "",
            postalCode: "",
            latitude: 0,
            longitude: 0,
            businessId: "",
        },
        validate: {
            name: (value) => (value.length < 2 ? t('validation.name') : null),
            latitude: (value) => (value < -90 || value > 90 ? t('validation.latitude') : null),
            longitude: (value) => (value < -180 || value > 180 ? t('validation.longitude') : null),
        },
    });

    useEffect(() => {
        if (location) {
            form.setValues({
                name: location.name,
                street: location.street,
                city: location.city,
                province: location.province,
                country: location.country,
                postalCode: location.postalCode,
                latitude: location.latitude,
                longitude: location.longitude,
                businessId: location.businessId,
            });
        }
    }, [location, form]);

    const handleSubmit = async (values: MediaLocationRequestDTO) => {
        if (!location) return;

        try {
            await updateMediaLocation(location.id, values);
            notifications.show({
                title: t('success.title'),
                message: t('success.message'),
                color: "green",
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                title: t('error.title'),
                message: t('error.message'),
                color: "red",
            });
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title={t('title')} size="lg">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput label={t('fields.name')} placeholder={t('placeholders.name')} {...form.getInputProps("name")} />
                    <TextInput label={t('fields.street')} placeholder={t('placeholders.street')} {...form.getInputProps("street")} />
                    <Group grow>
                        <TextInput label={t('fields.city')} placeholder={t('placeholders.city')} {...form.getInputProps("city")} />
                        <TextInput label={t('fields.province')} placeholder={t('placeholders.province')} {...form.getInputProps("province")} />
                    </Group>
                    <Group grow>
                        <TextInput label={t('fields.postalCode')} placeholder={t('placeholders.postalCode')} {...form.getInputProps("postalCode")} />
                        <TextInput label={t('fields.country')} placeholder={t('placeholders.country')} {...form.getInputProps("country")} />
                    </Group>
                    <Group grow>
                        <NumberInput label={t('fields.latitude')} decimalScale={6} {...form.getInputProps("latitude")} />
                        <NumberInput label={t('fields.longitude')} decimalScale={6} {...form.getInputProps("longitude")} />
                    </Group>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose}>
                            {t('buttons.cancel')}
                        </Button>
                        <Button type="submit">{t('buttons.save')}</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
