import React, { useEffect, useState } from 'react';
import { Modal, TextInput, Select, Button, Group, Box, Text, Stack, ThemeIcon, Alert, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { CreateAdPayload } from "@/shared/types/AdTypes";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { useTranslations } from 'next-intl'

interface AddAdModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: (payload: CreateAdPayload) => Promise<void>;
}

export function AddAdModal({ opened, onClose, onSuccess }: AddAdModalProps) {
    const t = useTranslations('AddAdModal');
    const [submitting, setSubmitting] = useState(false);

    // Cloudinary State
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [originalVideoDuration, setOriginalVideoDuration] = useState<number | null>(null);
    const [trimWarning, setTrimWarning] = useState<string | null>(null);

    const form = useForm({
        initialValues: {
            name: "",
            adType: "IMAGE",
            adDurationSeconds: "15",
        },
        validate: {
            name: (value) => (value.length < 2 ? t('validation.nameTooShort') : null),
        },
    });

    // --- Reset Logic ---
    const handleReset = () => {
        form.reset();
        setUploadedFileUrl(null);
        setOriginalVideoDuration(null);
        setTrimWarning(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    // --- Trimming Checker ---
    useEffect(() => {
        const selectedDuration = parseInt(form.values.adDurationSeconds);

        if (form.values.adType === 'VIDEO' && originalVideoDuration && originalVideoDuration > selectedDuration) {
            setTrimWarning(t('alerts.croppingMessage', { orig: Math.round(originalVideoDuration), keep: selectedDuration }));
        } else {
            setTrimWarning(null);
        }
    }, [form.values.adDurationSeconds, originalVideoDuration, form.values.adType, t]);

    // --- Cloudinary Success Callback ---
    const handleUploadSuccess = (results: CloudinaryUploadWidgetResults) => {
        if (typeof results.info === 'object' && results.info.secure_url) {
            setUploadedFileUrl(results.info.secure_url);

            const type = results.info.resource_type === 'video' ? 'VIDEO' : 'IMAGE';
            form.setFieldValue('adType', type);

            if (type === 'VIDEO' && results?.info?.duration != null) {
                const durationNum = Number(results.info.duration);
                setOriginalVideoDuration(Number.isFinite(durationNum) ? durationNum : null);
            } else {
                setOriginalVideoDuration(null);
            }
        }
    };

    // --- Submit Handler ---
    const handleSubmit = async (values: typeof form.values) => {
        if (!uploadedFileUrl) return;

        setSubmitting(true);
        try {
            let finalUrl = uploadedFileUrl;
            const durationInt = parseInt(values.adDurationSeconds);

            if (values.adType === 'VIDEO' && originalVideoDuration && originalVideoDuration > durationInt) {
                finalUrl = uploadedFileUrl.replace(
                    '/upload/',
                    `/upload/so_0,eo_${durationInt}/`
                );
            }

            await onSuccess({
                name: values.name,
                adType: values.adType as "IMAGE" | "VIDEO",
                adDurationSeconds: durationInt,
                adUrl: finalUrl
            });
            handleReset();
        } finally {
            setSubmitting(false);
        }
    };

    const typeOptions = [
        { value: 'IMAGE', label: t('type.image') },
        { value: 'VIDEO', label: t('type.video') },
    ];

    const durationOptions = [
        { value: '10', label: t('duration.10') },
        { value: '15', label: t('duration.15') },
        { value: '30', label: t('duration.30') },
    ];

    const widgetOptions = {
        sources: ['local', 'url'] as ('local' | 'url')[],
        resourceType: 'auto',
        multiple: false,
        maxFileSize: 50000000,
    };

    return (
        <Modal opened={opened} onClose={handleClose} title={t('title')} centered closeOnClickOutside={!submitting}>
            <Box pos="relative">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label={t('labels.name')}
                            placeholder={t('placeholders.name')}
                            required
                            {...form.getInputProps('name')}
                        />

                        {/* Duration select remains in place */}
                        <Select
                             label={t('labels.duration')}
                             data={durationOptions}
                             required
                             allowDeselect={false}
                             {...form.getInputProps('adDurationSeconds')}
                         />

                         <Box>
                            <Text size="sm" fw={500} mb={4}>
                                {t('labels.media')} <span style={{color: 'var(--mantine-color-red-text)'}}>*</span>
                            </Text>

                            <CldUploadWidget
                                signatureEndpoint="/api/cloudinary/sign-upload"
                                onSuccess={handleUploadSuccess}
                                options={widgetOptions}
                            >
                                {({ open }) => (
                                    <Group>
                                        <Button
                                            variant={uploadedFileUrl ? "default" : "filled"}
                                            leftSection={<IconUpload size={14}/>}
                                            onClick={() => open()}
                                            disabled={submitting}
                                        >
                                            {uploadedFileUrl ? t('buttons.changeFile') : t('buttons.uploadFile')}
                                        </Button>

                                        {uploadedFileUrl && (
                                            <Group gap="xs">
                                                <ThemeIcon color="green" size="sm" variant="light">
                                                    <IconCheck size={12} />
                                                </ThemeIcon>
                                                <Text size="sm" c="green">
                                                    {form.values.adType === 'VIDEO' ? t('status.videoUploaded') : t('status.imageUploaded')}
                                                </Text>
                                            </Group>
                                        )}
                                    </Group>
                                )}
                            </CldUploadWidget>
                             {!uploadedFileUrl && form.isTouched() && (
                                 <Text c="red" size="xs" mt={4}>{t('validation.fileRequired')}</Text>
                             )}
                            {/* Show detected media type under the upload widget as a non-interactive Badge */}
                            <Box mt="sm">
                                <Text size="sm" fw={500} mb={4}>{t('labels.type')}</Text>
                                <Group align="center">
                                    <Badge color={form.values.adType === 'VIDEO' ? 'blue' : 'gray'} variant="filled">
                                        {form.values.adType === 'VIDEO' ? t('type.video') : t('type.image')}
                                    </Badge>
                                    <Text size="xs" color="dimmed">{t('description.autoDetect')}</Text>
                                </Group>
                            </Box>

                             {trimWarning && (
                                 <Alert
                                     variant="light"
                                     color="orange"
                                     title={t('alerts.croppingTitle')}
                                     icon={<IconInfoCircle />}
                                     mt="sm"
                                 >
                                     {trimWarning}
                                 </Alert>
                             )}


                         </Box>

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={handleClose} disabled={submitting}>{t('buttons.cancel')}</Button>
                            <Button type="submit" loading={submitting} disabled={!uploadedFileUrl}>
                                {t('buttons.createAd')}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
}