"use client";

import { Stack, Title } from "@mantine/core";
import { useState } from "react";
import { useMediaList } from "@/pages/dashboard/media-owner/hooks/useMediaList";
import ProofMediaTable from "./tables/ProofMediaTable";
import SubmitProofStepperModal from "./modals/SubmitProofStepperModal";

export default function ProofOfDisplayScreen() {
    const { media } = useMediaList();

    const [opened, setOpened] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ id: string; name: string } | null>(null);

    return (
        <Stack gap="xs" p="md" style={{ flex: 1, minWidth: 0 }}>
            <Title order={2} mb={0}>
                Proof of Display
            </Title>

            <ProofMediaTable
                rows={media}
                onAddProof={(row) => {
                    setSelectedMedia({ id: String(row.id), name: row.name });
                    setOpened(true);
                }}
            />

            {selectedMedia && (
                <SubmitProofStepperModal
                    opened={opened}
                    onClose={() => setOpened(false)}
                    mediaId={selectedMedia.id}
                    mediaName={selectedMedia.name}
                />
            )}
        </Stack>
    );
}
