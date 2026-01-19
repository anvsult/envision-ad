"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Stepper,
    Select,
    Button,
    Group,
    Text,
    Alert,
    Loader,
    Stack,
    List,
} from "@mantine/core";
import { IconUpload, IconTrash } from "@tabler/icons-react";
import { CldUploadWidget } from "next-cloudinary";
import { useProofStepper } from "../../hooks/useProofStepper";

type Props = {
    opened: boolean;
    onClose: () => void;
    mediaId: string;
    mediaName: string;
};

type UploadedProof = {
    url: string;
    name: string;
};

export default function SubmitProofStepperModal({
                                                    opened,
                                                    onClose,
                                                    mediaId,
                                                    mediaName,
                                                }: Props) {
    const [active, setActive] = useState(0);

    const { campaigns, selectedCampaignId, setSelectedCampaignId, loadingCampaigns } =
        useProofStepper();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Store BOTH name + url (but only show name in UI)
    const [uploadedProofs, setUploadedProofs] = useState<UploadedProof[]>([]);

    // reset when modal closes
    useEffect(() => {
        if (!opened) {
            setActive(0);
            setSelectedCampaignId(null);
            setUploadedProofs([]);
            setError(null);
            setSubmitting(false);
        }
    }, [opened, setSelectedCampaignId]);

    // Cloudinary widget options (multiple)
    const widgetOptions = {
        sources: ["local", "url"] as ("local" | "url")[],
        resourceType: "image",
        multiple: true,
        maxFiles: 10,
        maxFileSize: 10000000,
    };

    const handleUploadSuccess = (results: any) => {
        const info = results?.info;

        if (typeof info !== "object" || !info?.secure_url) return;

        const url: string = info.secure_url;
        if (!url.startsWith("https://res.cloudinary.com/")) return;

        // Cloudinary usually provides original_filename (without extension)
        // Fall back to public_id if needed
        const baseName: string =
            info.original_filename ||
            (typeof info.public_id === "string" ? info.public_id.split("/").pop() : "uploaded-image");

        // If Cloudinary provides format, rebuild a nicer file name
        const ext: string | undefined = info.format ? `.${info.format}` : undefined;
        const name = ext ? `${baseName}${ext}` : baseName;

        setUploadedProofs((prev) => {
            if (prev.some((p) => p.url === url)) return prev;
            return [...prev, { url, name }];
        });
    };

    const canContinue = useMemo(() => {
        if (active === 0) return !!selectedCampaignId;
        if (active === 1) return uploadedProofs.length > 0 && !submitting;
        return true;
    }, [active, selectedCampaignId, uploadedProofs.length, submitting]);

    const prevStep = () => setActive((c) => (c > 0 ? c - 1 : c));

    async function submitProofFrontendOnly() {
        if (!selectedCampaignId) return;
        if (uploadedProofs.length === 0) return;

        setSubmitting(true);
        setError(null);

        try {
            console.log("PROOF SUBMITTED (frontend-only)", {
                mediaId,
                campaignId: selectedCampaignId,
                uploadedCount: uploadedProofs.length,
                fileNames: uploadedProofs.map((p) => p.name),
                urls: uploadedProofs.map((p) => p.url),
            });

            // tiny delay so user sees loading
            await new Promise((r) => setTimeout(r, 400));

            setActive(2);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    async function handlePrimaryAction() {
        // Step 1 -> Step 2
        if (active === 0) {
            setActive(1);
            return;
        }

        // Step 2 -> Submit -> Completed
        if (active === 1) {
            await submitProofFrontendOnly();
            return;
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} centered size="lg" title={`Add proof for ${mediaName}`}>
            <Stepper active={active}>
                <Stepper.Step label="Campaign" description="Select campaign">
                    {loadingCampaigns ? (
                        <Loader />
                    ) : (
                        <Select
                            label="Campaign"
                            placeholder="Select campaign"
                            data={campaigns.map((c) => ({
                                value: c.campaignId,
                                label: c.name,
                            }))}
                            value={selectedCampaignId}
                            onChange={setSelectedCampaignId}
                        />
                    )}
                </Stepper.Step>

                <Stepper.Step label="Upload" description="Upload proof images">
                    <Stack gap="sm">
                        <Text size="sm" c="dimmed">
                            Upload one or more photos showing the ad display.
                        </Text>

                        <CldUploadWidget
                            signatureEndpoint="/api/cloudinary/sign-upload"
                            onSuccess={handleUploadSuccess}
                            options={widgetOptions}
                        >
                            {({ open }) => (
                                <Button
                                    leftSection={<IconUpload size={16} />}
                                    onClick={() => open()}
                                    disabled={!selectedCampaignId || submitting}
                                    variant="light"
                                >
                                    Upload proof images
                                </Button>
                            )}
                        </CldUploadWidget>

                        {uploadedProofs.length > 0 && (
                            <Stack gap={6}>
                                <Group justify="space-between">
                                    <Text size="sm" fw={600}>
                                        Uploaded ({uploadedProofs.length})
                                    </Text>

                                    <Button
                                        size="xs"
                                        variant="subtle"
                                        color="red"
                                        leftSection={<IconTrash size={14} />}
                                        onClick={() => setUploadedProofs([])}
                                        disabled={submitting}
                                    >
                                        Clear
                                    </Button>
                                </Group>

                                {/* Show file NAMES only (not URLs) */}
                                <List size="sm" spacing={4}>
                                    {uploadedProofs.map((p) => (
                                        <List.Item key={p.url}>
                                            <Text size="sm" lineClamp={1}>
                                                {p.name}
                                            </Text>
                                        </List.Item>
                                    ))}
                                </List>
                            </Stack>
                        )}

                        {error && <Alert color="red">{error}</Alert>}
                    </Stack>
                </Stepper.Step>

                <Stepper.Completed>
                    <Stack gap="xs">
                        <Text fw={600}>Proof submitted</Text>
                        <Text size="sm" c="dimmed">
                            Uploaded {uploadedProofs.length} file(s).
                        </Text>

                        <Group justify="flex-end" mt="sm">
                            <Button onClick={onClose}>Close</Button>
                        </Group>
                    </Stack>
                </Stepper.Completed>
            </Stepper>

            {/* Footer: ONE primary button (Next -> Submit proof) */}
            {active < 2 && (
                <Group justify="space-between" mt="md">
                    <Button variant="default" onClick={prevStep} disabled={active === 0 || submitting}>
                        Back
                    </Button>

                    <Button
                        onClick={handlePrimaryAction}
                        loading={submitting}
                        disabled={!canContinue}
                    >
                        {active === 1 ? "Submit proof" : "Next"}
                    </Button>
                </Group>
            )}
        </Modal>
    );
}
