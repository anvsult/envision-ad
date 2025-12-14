import React, { useState } from 'react';
import { Modal, TextInput, Button, Group, Box, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { CreateAdCampaignPayload } from '@/types/AdCampaignTypes';

interface CreateCampaignModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: (payload: CreateAdCampaignPayload) => Promise<void>;
}

export function CreateCampaignModal({ opened, onClose, onSuccess }: CreateCampaignModalProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm({
        initialValues: {
            name: '',
        },
        validate: {
            name: (value) => (value.trim().length < 2 ? 'Name too short' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setSubmitting(true);
        try {
            await onSuccess({ name: values.name.trim() } as CreateAdCampaignPayload);
            form.reset();
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal opened={opened} onClose={handleClose} title="Create Campaign" centered closeOnClickOutside={!submitting}>
            <Box>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput label="Name" placeholder="Campaign name" required {...form.getInputProps('name')} />

                        <Group justify="flex-end">
                            <Button variant="default" onClick={handleClose} disabled={submitting}>Cancel</Button>
                            <Button type="submit" loading={submitting}>Create</Button>
                        </Group>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
}
