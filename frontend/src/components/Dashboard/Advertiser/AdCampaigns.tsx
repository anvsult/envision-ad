"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header/Header";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Box, Button, Drawer, Group, Paper, Stack, Title } from "@mantine/core";
import SideBar from "@/components/SideBar/SideBar";
import { notifications } from "@mantine/notifications";
import { useUser } from "@auth0/nextjs-auth0/client";

// Imports from our new files
import { AdCampaign, CreateAdPayload } from "@/types/AdTypes";
import { getAllAdCampaigns, addAdToCampaign, deleteAdFromCampaign, createAdCampaign } from "@/services/AdCampaignService";
import { CreateAdCampaignPayload } from "@/types/AdCampaignTypes";
import { AdCampaignsTable } from "@/components/Dashboard/Advertiser/Tables/AdCampaignsTable";
import { AddAdModal } from "@/components/Dashboard/Advertiser/Modals/AddAdModal";
import { CreateCampaignModal } from "@/components/Dashboard/Advertiser/Modals/CreateCampaignModal";
import { ConfirmationModal } from "@/shared/modals/ConfirmationModal";

export function AdCampaigns() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

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
            notifications.show({ title: 'Error', message: 'Failed to load campaigns', color: 'red' });
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
                notifications.show({ title: 'Error', message: 'Failed to load campaigns', color: 'red' });
            }
        };

        fetchData();
    }, [user]);

    // 2. Handlers
    const handleOpenAddAd = (campaignId: string) => {
        setTargetCampaignId(campaignId);
        setIsAddAdModalOpen(true);
    };

    const handleSuccessAddAd = async (payload: CreateAdPayload) => {
        if (!targetCampaignId) return;
        try {
            await addAdToCampaign(targetCampaignId, payload);
            notifications.show({ title: 'Success', message: 'Ad Added', color: 'green' });
            setIsAddAdModalOpen(false);
            loadCampaigns(); // Refresh list
        } catch (error) {
            console.error('Failed to save ad', error);
            notifications.show({ title: 'Error', message: 'Failed to save ad', color: 'red' });
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
            notifications.show({ title: 'Deleted', message: 'Ad removed', color: 'green' });
            loadCampaigns(); // Refresh list
        } catch (error) {
            console.error('Failed to delete ad', error);
            notifications.show({ title: 'Error', message: 'Failed to delete ad', color: 'red' });
        } finally {
            setConfirmDeleteOpen(false);
            setAdToDelete(null);
        }
    };

    // Create Campaign Handler
    const handleCreateCampaign = async (payload: CreateAdCampaignPayload) => {
        try {
            await createAdCampaign(payload);
            notifications.show({ title: 'Success', message: 'Campaign created', color: 'green' });
            setIsCreateCampaignOpen(false);
            loadCampaigns();
        } catch (error) {
            console.error('Failed to create campaign', error);
            notifications.show({ title: 'Error', message: 'Failed to create campaign', color: 'red' });
        }
    };

    return (
        <>
            <Header dashboardMode={true} sidebarOpened={opened} onToggleSidebar={toggle} />

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
                                <Title order={2}>My Campaigns</Title>
                                <Button onClick={() => setIsCreateCampaignOpen(true)}>
                                    Create Campaign
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
                                title="Delete Ad"
                                message="Are you sure you want to delete this ad? This action cannot be undone."
                                confirmLabel="Delete"
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