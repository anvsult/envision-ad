import React, { useEffect, useState } from 'react';
import { Modal, TextInput, Select, Button, Group, Box, Text, Stack, ThemeIcon, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { CreateAdPayload } from "@/types/AdTypes";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';

interface AddAdModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: (payload: CreateAdPayload) => Promise<void>;
}

export function AddAdModal({ opened, onClose, onSuccess }: AddAdModalProps) {
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
            name: (value) => (value.length < 2 ? "Name too short" : null),
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
    // Runs whenever the user changes the Duration Dropdown OR uploads a new video
    useEffect(() => {
        const selectedDuration = parseInt(form.values.adDurationSeconds);

        if (form.values.adType === 'VIDEO' && originalVideoDuration && originalVideoDuration > selectedDuration) {
            setTrimWarning(`Video is ${Math.round(originalVideoDuration)}s. It will be cropped to the first ${selectedDuration}s.`);
        } else {
            setTrimWarning(null);
        }
    }, [form.values.adDurationSeconds, originalVideoDuration, form.values.adType]);


    // --- Cloudinary Success Callback ---
    const handleUploadSuccess = (results: CloudinaryUploadWidgetResults) => {
        if (typeof results.info === 'object' && results.info.secure_url) {

            // 1. Set URL
            setUploadedFileUrl(results.info.secure_url);

            // 2. Auto-Detect Type
            // Cloudinary returns 'image' or 'video' in resource_type
            const type = results.info.resource_type === 'video' ? 'VIDEO' : 'IMAGE';
            form.setFieldValue('adType', type);

            // 3. Handle Video Specifics
            if (type === 'VIDEO' && results.info.duration) {
                setOriginalVideoDuration(results.info.duration);
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

            // Apply Trimming Transformation if needed
            if (values.adType === 'VIDEO' && originalVideoDuration && originalVideoDuration > durationInt) {
                // Cloudinary URL manipulation: Insert transformation after "/upload/"
                // Example: .../upload/v123/video.mp4 -> .../upload/so_0,eo_15/v123/video.mp4
                // so_0 = Start Offset 0s
                // eo_15 = End Offset 15s
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

    // Widget Options: allow both image and video
    const widgetOptions = {
        sources: ['local', 'url'] as ('local' | 'url')[],
        resourceType: 'auto', // Allows uploading both images and videos
        multiple: false,
        maxFileSize: 50000000, // Optional: 50MB limit
    };

    return (
        <Modal opened={opened} onClose={handleClose} title="Add New Ad" centered closeOnClickOutside={!submitting}>
            <Box pos="relative">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label="Name"
                            placeholder="Ad Name"
                            required
                            {...form.getInputProps('name')}
                        />

                        {/* Auto-detected, so we disable user interaction but show the value */}
                        <Select
                            label="Type"
                            data={['IMAGE', 'VIDEO']}
                            required
                            disabled // User cannot change this manually anymore
                            {...form.getInputProps('adType')}
                            description="Automatically set based on uploaded file"
                        />

                        <Select
                            label="Duration"
                            data={['10', '15', '30']}
                            required
                            allowDeselect={false}
                            {...form.getInputProps('adDurationSeconds')}
                        />

                        {/* --- CLOUDINARY WIDGET SECTION --- */}
                        <Box>
                            <Text size="sm" fw={500} mb={4}>Media <span style={{color: 'var(--mantine-color-red-text)'}}>*</span></Text>

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
                                            {uploadedFileUrl ? "Change File" : "Upload File"}
                                        </Button>

                                        {uploadedFileUrl && (
                                            <Group gap="xs">
                                                <ThemeIcon color="green" size="sm" variant="light">
                                                    <IconCheck size={12} />
                                                </ThemeIcon>
                                                <Text size="sm" c="green">
                                                    {form.values.adType === 'VIDEO' ? 'Video' : 'Image'} Uploaded
                                                </Text>
                                            </Group>
                                        )}
                                    </Group>
                                )}
                            </CldUploadWidget>

                            {/* Warning Alert for Cropping */}
                            {trimWarning && (
                                <Alert
                                    variant="light"
                                    color="orange"
                                    title="Automatic Cropping"
                                    icon={<IconInfoCircle />}
                                    mt="sm"
                                >
                                    {trimWarning}
                                </Alert>
                            )}

                            {!uploadedFileUrl && form.isTouched() && (
                                <Text c="red" size="xs" mt={4}>file is required</Text>
                            )}
                        </Box>

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={handleClose} disabled={submitting}>Cancel</Button>
                            <Button type="submit" loading={submitting} disabled={!uploadedFileUrl}>
                                Create Ad
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
}