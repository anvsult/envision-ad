"use client";

import { Stack, Title } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useMediaList } from "@/pages/dashboard/media-owner/hooks/useMediaList";
import ProofMediaTable from "./tables/ProofMediaTable";
import SubmitProofStepperModal from "./modals/SubmitProofStepperModal";
import { getMediaReservations } from "@/features/reservation-management/api";
import { useTranslations } from "next-intl";


type CountsMap = Record<string, number>;

export default function ProofOfDisplayScreen() {
    const { media } = useMediaList();

    const [opened, setOpened] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ id: string; name: string } | null>(null);

    const [activeAdsCounts, setActiveAdsCounts] = useState<CountsMap>({});

    const mediaIds = useMemo(
        () => (media ?? []).map((m) => String(m.id)).filter(Boolean),
        [media]
    );
    const t = useTranslations("proofOfDisplay");

    useEffect(() => {
        if (mediaIds.length === 0) return;

        let cancelled = false;

        const loadCounts = async () => {
            try {
                // fetch reservations for each media and count unique campaigns
                const results = await Promise.all(
                    mediaIds.map(async (id) => {
                        try {
                            const reservations = await getMediaReservations(id);

                            const uniqueCampaigns = new Set(
                                reservations
                                    .filter((r: any) => r.status === "ACTIVE" || r.status === "PENDING")
                                    .map((r: any) => r.campaignId)
                                    .filter(Boolean)
                            );

                            return [id, uniqueCampaigns.size] as const;
                        } catch {
                            return [id, 0] as const;
                        }
                    })
                );

                if (cancelled) return;

                const map: CountsMap = {};
                for (const [id, count] of results) map[id] = count;

                setActiveAdsCounts(map);
            } catch {
                if (!cancelled) setActiveAdsCounts({});
            }
        };

        void loadCounts();

        return () => {
            cancelled = true;
        };
    }, [mediaIds]);

    return (
        <Stack gap="xs" p="md" style={{ flex: 1, minWidth: 0 }}>
            <Title order={2} mb={0}>
                {t("page.title")}
            </Title>

            <ProofMediaTable
                rows={media}
                activeAdsCounts={activeAdsCounts}
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
