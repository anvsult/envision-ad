"use client";

import React, {useCallback, useEffect, useState} from "react";
import {Button, Group, Stack, Title} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {useUser} from "@auth0/nextjs-auth0/client";
import {useTranslations} from 'next-intl';


// Imports from our new files
import {AdRequestDTO} from "@/entities/ad";
import {AdCampaign, AdCampaignRequestDTO} from "@/entities/ad-campaign";
import {
    addAdToCampaign,
    createAdCampaign, deleteAdCampaign,
    deleteAdFromCampaign,
    getAllAdCampaigns
} from "@/features/ad-campaign-management/api";
import {AdCampaignsTable} from "@/pages/dashboard/advertiser/ui/tables/AdCampaignsTable";
import {AddAdModal} from "@/pages/dashboard/advertiser/ui/modals/AddAdModal";
import {CreateCampaignModal} from "@/pages/dashboard/advertiser/ui/modals/CreateCampaignModal";
import {ConfirmationModal} from "@/shared/ui/ConfirmationModal";
import {useOrganization} from "@/app/providers";

export default function AdCampaigns() {
    const t = useTranslations('adCampaigns');

    // Data State
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [businessId, setBusinessId] = useState<string | undefined>();
    const {user} = useUser();
    const { organization } = useOrganization();

    // Modal State
    const [isAddAdModalOpen, setIsAddAdModalOpen] = useState(false);
    const [targetCampaignId, setTargetCampaignId] = useState<string | null>(null);

    // Create Campaign Modal State
    const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

    // Confirmation Modal State
    const [confirmDeleteAdOpen, setConfirmDeleteAdOpen] = useState(false);
    const [confirmDeleteCampaignOpen, setConfirmDeleteCampaignOpen] = useState(false);
    const [adToDelete, setAdToDelete] = useState<{ campaignId: string; adId: string } | null>(null);
    const [campaignIdToDelete, setCampaignIdToDelete] = useState<string | null>(null);

    // 1. Fetch Data - Single method to load campaigns
    const loadCampaigns = useCallback(async () => {
        if (!organization) return;
        try {
            const data = await getAllAdCampaigns(organization.businessId);
            setCampaigns(data);
        } catch (error) {
            console.error('Failed to load campaigns', error);
            notifications.show({
                title: t('notifications.loadFailed.title'),
                message: t('notifications.loadFailed.message'),
                color: 'red'
            });
        }
    }, [organization, t]);

    useEffect(() => {
        if (!organization) return;

        let ignored = false;

        const fetchCampaigns = async () => {
            try {
                const data = await getAllAdCampaigns(organization.businessId);
                if (!ignored) setCampaigns(data);
            } catch (error) {
                if (!ignored) {
                    console.error('Failed to load campaigns', error);
                    notifications.show({
                        title: t('notifications.loadFailed.title'),
                        message: t('notifications.loadFailed.message'),
                        color: 'red'
                    });
                }
            }
        };

        void fetchCampaigns();

        return () => { ignored = true; };
    }, [organization, t]);

    // 2. Handlers
    const handleOpenAddAd = (campaignId: string) => {
        setTargetCampaignId(campaignId);
        setIsAddAdModalOpen(true);
    };

    const handleSuccessAddAd = async (payload: AdRequestDTO) => {
        if (!targetCampaignId) return;

        try {
            await addAdToCampaign(targetCampaignId, payload);

            notifications.show({
                title: t('notifications.addAd.success.title'),
                message: t('notifications.addAd.success.message'),
                color: 'green'
            });

            setIsAddAdModalOpen(false);
            await loadCampaigns();
        } catch (error) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            const status = err.response?.status;
            const serverMessage = err.response?.data?.message;

            let messageToShow: string;
            if (status === 409) {
                messageToShow = t('notifications.addAd.error.tiedReservationMessage');
            } else if (serverMessage) {
                messageToShow = serverMessage;
            } else {
                messageToShow = t('notifications.addAd.error.genericMessage');
            }

            notifications.show({
                title: t('notifications.addAd.error.title'),
                message: messageToShow,
                color: 'red'
            });

            throw error;
        }
    };


    const handleDeleteAd = (campaignId: string, adId: string) => {
        setAdToDelete({campaignId, adId});
        setConfirmDeleteAdOpen(true);
    };

    const handleDeleteAdCampaign = (campaignId: string) => {
        setCampaignIdToDelete(campaignId);
        setConfirmDeleteCampaignOpen(true);
    }

    const confirmDeleteAd = async () => {
        if (!adToDelete) return;

        try {
            await deleteAdFromCampaign(adToDelete.campaignId, adToDelete.adId);
            notifications.show({
                title: t('notifications.deleteAd.success.title'),
                message: t('notifications.deleteAd.success.message'),
                color: 'green'
            });
            await loadCampaigns(); // Refresh list
            setConfirmDeleteAdOpen(false);
            setAdToDelete(null);
        } catch (error) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            const status = err.response?.status;
            const serverMessage = err.response?.data?.message;

            let messageToShow: string;
            if (status === 409) {
                messageToShow = t('notifications.deleteAd.error.tiedReservationMessage');
            } else if (serverMessage) {
                messageToShow = serverMessage;
            } else {
                messageToShow = t('notifications.deleteAd.error.genericMessage');
            }

            notifications.show({
                title: t('notifications.deleteAd.error.title'),
                message: messageToShow,
                color: 'red'
            });
        }
    };

    const confirmDeleteCampaign = async () => {
        if (!campaignIdToDelete) return;
        if (!businessId) return;

        try {
            await deleteAdCampaign(businessId, campaignIdToDelete);
            notifications.show({
                title: t('notifications.deleteCampaign.success.title'),
                message: t('notifications.deleteCampaign.success.message'),
                color: 'green'
            });
            await loadCampaigns(); // Refresh list
            setConfirmDeleteCampaignOpen(false);
            setCampaignIdToDelete(null);
        } catch (error) {
            console.error('Failed to delete campaign', error);

            // Simple type narrowing
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            const status = err.response?.status;
            const serverMessage = err.response?.data?.message;

            let messageToShow: string;
            if (status === 409) {
                messageToShow = t('notifications.deleteCampaign.error.tiedReservationMessage');
            } else if (serverMessage) {
                messageToShow = serverMessage;
            } else {
                messageToShow = t('notifications.deleteCampaign.error.genericMessage');
            }

            notifications.show({
                title: t('notifications.deleteCampaign.error.title'),
                message: messageToShow,
                color: 'red'
            });
        }
    }

    // Create Campaign Handler
    const handleCreateCampaign = async (payload: AdCampaignRequestDTO) => {
        if (!businessId) return;

        try {
            await createAdCampaign(businessId, payload);
            notifications.show({
                title: t('notifications.createCampaign.success.title'),
                message: t('notifications.createCampaign.success.message'),
                color: 'green'
            });
            setIsCreateCampaignOpen(false);
            loadCampaigns();
        } catch (error) {
            console.error('Failed to create campaign', error);
            notifications.show({
                title: t('notifications.createCampaign.error.title'),
                message: t('notifications.createCampaign.error.message'),
                color: 'red'
            });
        }
    };

    return (
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
                onDeleteAdCampaign={handleDeleteAdCampaign}
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
                opened={confirmDeleteAdOpen}
                title={t('confirmations.deleteAd.title')}
                message={t('confirmations.deleteAd.message')}
                confirmLabel={t('confirmations.delete.confirm')}
                cancelLabel={t('confirmations.delete.cancel')}
                confirmColor="red"
                onConfirm={confirmDeleteAd}
                onCancel={() => setConfirmDeleteAdOpen(false)}
            />
            <ConfirmationModal
                opened={confirmDeleteCampaignOpen}
                title={t('confirmations.deleteCampaign.title')}
                message={t('confirmations.deleteCampaign.message')}
                confirmLabel={t('confirmations.delete.confirm')}
                cancelLabel={t('confirmations.delete.cancel')}
                confirmColor="red"
                onConfirm={confirmDeleteCampaign}
                onCancel={() => setConfirmDeleteCampaignOpen(false)}
            />
        </Stack>
    );
}
