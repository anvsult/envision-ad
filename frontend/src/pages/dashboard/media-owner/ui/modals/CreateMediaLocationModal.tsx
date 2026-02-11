import React, { useState } from 'react';
import { Modal, TextInput, Button, Group, Stack, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';
import { MediaLocationRequestDTO } from "@/entities/media-location/model/mediaLocation";
import { GetAddressDetails } from '@/shared/lib/geolocation/LocationService';

interface CreateMediaLocationModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: (payload: MediaLocationRequestDTO) => Promise<void>;
}

export function CreateMediaLocationModal({ opened, onClose, onSuccess }: CreateMediaLocationModalProps) {
    const t = useTranslations('CreateMediaLocationModal');
    const [submitting, setSubmitting] = useState(false);
    const [fetchingCoords, setFetchingCoords] = useState(false);

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
        },
        validate: {
            name: (value) => (!value.trim() ? t('validation.nameRequired') : value.length < 2 ? t('validation.nameTooShort') : null),
            street: (value) => (!value.trim() ? t('validation.streetRequired') : null),
            city: (value) => (!value.trim() ? t('validation.cityRequired') : null),
            country: (value) => (!value.trim() ? t('validation.countryRequired') : null),
        },
    });

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const fetchCoordinates = async () => {
        const { street, city, province, country } = form.values;
        if (!street || !city || !country) return;

        setFetchingCoords(true);
        try {
            const query = `${street}, ${city}, ${province}, ${country}`;
            const details = await GetAddressDetails(query, 'en');

            if (details) {
                form.setFieldValue('latitude', parseFloat(details.lat.toString()));
                form.setFieldValue('longitude', parseFloat(details.lng.toString()));
            }
        } catch (error) {
            console.error("Failed to fetch coordinates", error);
        } finally {
            setFetchingCoords(false);
        }
    };

    const handleSubmit = async (values: MediaLocationRequestDTO) => {
        setSubmitting(true);
        // Ensure coordinates are fetched if 0,0 (though user should ideally verify)
        if (values.latitude === 0 && values.longitude === 0) {
            await fetchCoordinates();
        }

        try {
            // Re-read values in case fetchCoordinates updated them
            await onSuccess(form.values);
            handleClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={handleClose} title={t('title')} centered closeOnClickOutside={!submitting}>
            <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
                <Stack gap="md">
                    <TextInput
                        label={t('labels.name')}
                        placeholder={t('placeholders.name')}
                        required
                        {...form.getInputProps('name')}
                    />



                    <TextInput
                        label={t('labels.street')}
                        placeholder={t('placeholders.street')}
                        required
                        onBlur={fetchCoordinates}
                        {...form.getInputProps('street')}
                    />

                    <Group grow>
                        <TextInput
                            label={t('labels.city')}
                            placeholder={t('placeholders.city')}
                            required
                            onBlur={fetchCoordinates}
                            {...form.getInputProps('city')}
                        />
                        <TextInput
                            label={t('labels.province')}
                            placeholder={t('placeholders.province')}
                            onBlur={fetchCoordinates}
                            {...form.getInputProps('province')}
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label={t('labels.country')}
                            placeholder={t('placeholders.country')}
                            required
                            onBlur={fetchCoordinates}
                            {...form.getInputProps('country')}
                        />
                        <TextInput
                            label={t('labels.postalCode')}
                            placeholder={t('placeholders.postalCode')}
                            {...form.getInputProps('postalCode')}
                        />
                    </Group>



                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={handleClose} disabled={submitting}>{t('buttons.cancel')}</Button>
                        <Button type="submit" loading={submitting || fetchingCoords}>
                            {t('buttons.create')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
