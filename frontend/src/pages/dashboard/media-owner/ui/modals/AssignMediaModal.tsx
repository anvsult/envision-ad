import React, { useEffect, useState } from 'react';
import { Modal, Button, Group, Stack, Select, Text, LoadingOverlay } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { Media } from '@/entities/media';
import { getMediaByBusinessId } from '@/features/media-management/api';
import { assignMediaToLocation } from '@/features/media-location-management/api'; // We need to add this
import { notifications } from '@mantine/notifications';

interface AssignMediaModalProps {
    opened: boolean;
    onClose: () => void;
    locationId: string | null;
    businessId: string | undefined;
    onSuccess: () => void;
}

export function AssignMediaModal({ opened, onClose, locationId, businessId, onSuccess }: AssignMediaModalProps) {
    const t = useTranslations('AssignMediaModal');
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchMedia = async () => {
            if (!businessId) return;
            setLoading(true);
            try {
                const data = await getMediaByBusinessId(businessId);
                setMediaList(data);
            } catch (error) {
                console.error("Failed to fetch media", error);
                notifications.show({
                    title: t('errors.fetchFailed.title'),
                    message: t('errors.fetchFailed.message'),
                    color: "red"
                });
            } finally {
                setLoading(false);
            }
        };

        if (opened && businessId) {
            fetchMedia();
        }
    }, [opened, businessId, t]);

    const handleAssign = async () => {
        if (!selectedMediaId || !locationId) return;
        setSubmitting(true);
        try {
            await assignMediaToLocation(locationId, selectedMediaId);
            notifications.show({
                title: t('success.title'),
                message: t('success.message'),
                color: "green"
            });
            onSuccess();
            onClose();
            setSelectedMediaId(null);
        } catch (error) {
            console.error("Failed to assign media", error);
            notifications.show({
                title: t('errors.assignFailed.title'),
                message: t('errors.assignFailed.message'),
                color: "red"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const mediaOptions = mediaList
        .filter(media => media.id)
        .map(media => ({
            value: media.id as string,
            label: `${media.title} (${media.typeOfDisplay})`
        }));

    return (
        <Modal opened={opened} onClose={onClose} title={t('title')} centered>
            <Stack>
                <LoadingOverlay visible={loading} />
                <Text size="sm" c="dimmed">
                    {t('description')}
                </Text>

                <Select
                    label={t('selectMedia')}
                    placeholder={t('selectPlaceholder')}
                    data={mediaOptions}
                    value={selectedMediaId}
                    onChange={setSelectedMediaId}
                    searchable
                    nothingFoundMessage={t('noMediaFound')}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose} disabled={submitting}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleAssign}
                        loading={submitting}
                        disabled={!selectedMediaId}
                    >
                        {t('assign')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
