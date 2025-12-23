"use client";

import React, { useEffect, useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Box, Button, Drawer, Group, Paper, Stack, Title } from "@mantine/core";
import SideBar from "@/components/SideBar/SideBar";
import { notifications } from "@mantine/notifications";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTranslations } from 'next-intl';


// Imports from our new files
import { AdRequestDTO } from "@/entities/ad";
import { AdCampaign } from "@/entities/ad-campaign";
import { getAllAdCampaigns, addAdToCampaign, deleteAdFromCampaign, createAdCampaign } from "@/features/ad-campaign-management/api";
import { AdCampaignRequestDTO } from "@/entities/ad-campaign";
import { AdCampaignsTable } from "@/pages/dashboard/ui/advertiser/ui/tables/AdCampaignsTable";
import { AddAdModal } from "@/pages/dashboard/ui/advertiser/ui/modals/AddAdModal";
import { CreateCampaignModal } from "@/pages/dashboard/ui/advertiser/ui/modals/CreateCampaignModal";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";

export default function AdCampaigns() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const t = useTranslations('adCampaigns');

    // Data State
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const { user } = useUser();

    // Modal State
    const [isAddAdModalOpen, setIsAddAdModalOpen] = useState(false);
    const [targetCampaignId, setTargetCampaignId] = useState<string | null>(null);

    // Create Campaign Modal State
    const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

    // Confirmation Modal State
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [adToDelete, setAdToDelete] = useState<{ campaignId: string; adId: string } | null>(null);

    // 1. Fetch Data
    const loadCampaigns = async () => {
        try {
            const data = await getAllAdCampaigns();
            setCampaigns(data);
        } catch (e) {
            notifications.show({ title: t('notifications.loadFailed.title'), message: t('notifications.loadFailed.message'), color: 'red' });
        }
    };

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const data = await getAllAdCampaigns();
                setCampaigns(data);
            } catch (error) {
                console.error('Failed to load campaigns', error);
                notifications.show({ title: t('notifications.loadFailed.title'), message: t('notifications.loadFailed.message'), color: 'red' });
            }
        };

        fetchData();
    }, [user]);

    // 2. Handlers
    const handleOpenAddAd = (campaignId: string) => {
        setTargetCampaignId(campaignId);
        setIsAddAdModalOpen(true);
    };

    const handleSuccessAddAd = async (payload: AdRequestDTO) => {
        if (!targetCampaignId) return;
        try {
            await addAdToCampaign(targetCampaignId, payload);
            notifications.show({ title: t('notifications.addAd.success.title'), message: t('notifications.addAd.success.message'), color: 'green' });
            setIsAddAdModalOpen(false);
            loadCampaigns(); // Refresh list
        } catch (error) {
            console.error('Failed to save ad', error);
            notifications.show({ title: t('notifications.addAd.error.title'), message: t('notifications.addAd.error.message'), color: 'red' });
        }
    };

    const handleDeleteAd = (campaignId: string, adId: string) => {
        setAdToDelete({ campaignId, adId });
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!adToDelete) return;

        try {
            await deleteAdFromCampaign(adToDelete.campaignId, adToDelete.adId);
            notifications.show({ title: t('notifications.deleteAd.success.title'), message: t('notifications.deleteAd.success.message'), color: 'green' });
            loadCampaigns(); // Refresh list
        } catch (error) {
            console.error('Failed to delete ad', error);
            notifications.show({ title: t('notifications.deleteAd.error.title'), message: t('notifications.deleteAd.error.message'), color: 'red' });
        } finally {
            setConfirmDeleteOpen(false);
            setAdToDelete(null);
        }
    };

    // Create Campaign Handler
    const handleCreateCampaign = async (payload: AdCampaignRequestDTO) => {
        try {
            await createAdCampaign(payload);
            notifications.show({ title: t('notifications.createCampaign.success.title'), message: t('notifications.createCampaign.success.message'), color: 'green' });
            setIsCreateCampaignOpen(false);
            loadCampaigns();
        } catch (error) {
            console.error('Failed to create campaign', error);
            notifications.show({ title: t('notifications.createCampaign.error.title'), message: t('notifications.createCampaign.error.message'), color: 'red' });
        }
    };

    return (
        <>
            <Box>
                {/* Mobile Sidebar Drawer */}
                <Drawer opened={opened} onClose={close} size="xs" padding="md" hiddenFrom="md" zIndex={1000}>
                    <SideBar />
                </Drawer>

                <Group align="flex-start" gap={0} wrap="nowrap">
                    {/* Desktop Sidebar */}
                    {!isMobile && (
                        <Paper w={250} p="md" style={{ minHeight: "calc(100vh - 80px)", borderRadius: 0 }} withBorder>
                            <SideBar />
                        </Paper>
                    )}

                    {/* Main Content Area */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Stack gap="md" p="md">

                            {/* Page Title & Top Actions */}
                            <Group justify="space-between">
                                <Title order={2}>{t('page.title')}</Title>
                                <Button onClick={() => setIsCreateCampaignOpen(true)}>
                                    {t('page.createButton')}
                                </Button>
                            </Group>

                            <AdCampaignsTable
                                campaigns={campaigns}
                                onDeleteAd={handleDeleteAd}
                                onOpenAddAd={handleOpenAddAd}
                            />

                            <AddAdModal
                                opened={isAddAdModalOpen}
                                onClose={() => setIsAddAdModalOpen(false)}
                                onSuccess={handleSuccessAddAd}
                            />

                            <CreateCampaignModal
                                opened={isCreateCampaignOpen}
                                onClose={() => setIsCreateCampaignOpen(false)}
                                onSuccess={handleCreateCampaign}
                            />

                            <ConfirmationModal
                                opened={confirmDeleteOpen}
                                title={t('confirmations.deleteAd.title')}
                                message={t('confirmations.deleteAd.message')}
                                confirmLabel={t('confirmations.deleteAd.confirm')}
                                confirmColor="red"
                                onConfirm={confirmDelete}
                                onCancel={() => setConfirmDeleteOpen(false)}
                            />

                        </Stack>
                     </div>
                 </Group>
             </Box>
         </>
     );
 }
