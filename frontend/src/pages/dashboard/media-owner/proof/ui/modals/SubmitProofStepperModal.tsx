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
    FileInput,
    Stack,
} from "@mantine/core";
import { useProofStepper } from "../../hooks/useProofStepper";

type Props = {
    opened: boolean;
    onClose: () => void;
    mediaId: string;
    mediaName: string;
};

export default function SubmitProofStepperModal({
                                                    opened,
                                                    onClose,
                                                    mediaId,
                                                    mediaName,
                                                }: Props) {

    const [active, setActive] = useState(0);
    const {
        campaigns,
        selectedCampaignId,
        setSelectedCampaignId,
        loadingCampaigns,
    } = useProofStepper();

    const [files, setFiles] = useState<File[] | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // reset when modal closes
    useEffect(() => {
        if (!opened) {
            setActive(0);
            setSelectedCampaignId(null);
            setFiles(undefined);
            setError(null);
            setSubmitting(false);
        }
    }, [opened, setSelectedCampaignId]);

    const canNext = useMemo(() => {
        if (active === 0) return !!selectedCampaignId;
        if (active === 1) return (files?.length ?? 0) > 0 && !submitting;
        return true;
    }, [active, selectedCampaignId, files, submitting]);

    const nextStep = () => setActive((c) => (c < 2 ? c + 1 : c));
    const prevStep = () => setActive((c) => (c > 0 ? c - 1 : c));

    async function handleSubmitFrontendOnly() {
        if (!selectedCampaignId) return;
        if (!files || files.length === 0) return;

        setSubmitting(true);
        setError(null);

        try {
            console.log("PROOF SUBMITTED (frontend-only)", {
                mediaId,
                campaignId: selectedCampaignId,
                filesCount: files.length,
                fileNames: files.map((f) => f.name),
            });

            // Small delay
            await new Promise((r) => setTimeout(r, 400));

            setActive(2);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} centered size="lg" title={`Add proof • ${mediaName}`}>
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

                        <FileInput
                            label="Proof images"
                            placeholder="Select images"
                            multiple
                            accept="image/*"
                            value={files}
                            onChange={setFiles}
                            clearable
                        />

                        {error && <Alert color="red">{error}</Alert>}

                        <Group justify="flex-end">
                            <Button
                                onClick={handleSubmitFrontendOnly}
                                loading={submitting}
                                disabled={!selectedCampaignId || !(files?.length ?? 0)}
                            >
                                Submit proof
                            </Button>
                        </Group>
                    </Stack>
                </Stepper.Step>

                <Stepper.Completed>
                    <Stack gap="xs">
                        <Text fw={600}>Proof submitted</Text>
                        <Text size="sm" c="dimmed">
                            {/* TODO Implement Cloudinary*/}
                            Frontend-only
                        </Text>
                        <Text size="sm">Files selected: {files?.length ?? 0}</Text>

                        <Group justify="flex-end" mt="sm">
                            <Button onClick={onClose}>Close</Button>
                        </Group>
                    </Stack>
                </Stepper.Completed>
            </Stepper>

            {active < 2 && (
                <Group justify="center" mt="md">
                    <Button variant="default" onClick={prevStep} disabled={active === 0 || submitting}>
                        Back
                    </Button>
                    <Button onClick={nextStep} disabled={!canNext || submitting}>
                        Next
                    </Button>
                </Group>
            )}
        </Modal>
    );
}
