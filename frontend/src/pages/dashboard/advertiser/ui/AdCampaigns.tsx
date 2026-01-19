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
    createAdCampaign,
    deleteAdFromCampaign,
    getAllAdCampaigns
} from "@/features/ad-campaign-management/api";
import {AdCampaignsTable} from "@/pages/dashboard/advertiser/ui/tables/AdCampaignsTable";
import {AddAdModal} from "@/pages/dashboard/advertiser/ui/modals/AddAdModal";
import {CreateCampaignModal} from "@/pages/dashboard/advertiser/ui/modals/CreateCampaignModal";
import {ConfirmationModal} from "@/shared/ui/ConfirmationModal";
import {getEmployeeOrganization} from "@/features/organization-management/api";

export default function AdCampaigns() {
    const t = useTranslations('adCampaigns');

    // Data State
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [businessId, setBusinessId] = useState<string | undefined>();
    const {user} = useUser();

    // Modal State
    const [isAddAdModalOpen, setIsAddAdModalOpen] = useState(false);
    const [targetCampaignId, setTargetCampaignId] = useState<string | null>(null);

    // Create Campaign Modal State
    const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

    // Confirmation Modal State
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [adToDelete, setAdToDelete] = useState<{ campaignId: string; adId: string } | null>(null);

    // 1. Fetch Data - Single method to load campaigns
    const loadCampaigns = useCallback(async () => {
        if (!businessId) return;

        try {
            const data = await getAllAdCampaigns(businessId);
            setCampaigns(data);
        } catch (error) {
            console.error('Failed to load campaigns', error);
            notifications.show({
                title: t('notifications.loadFailed.title'),
                message: t('notifications.loadFailed.message'),
                color: 'red'
            });
        }
    }, [businessId, t]);

    // Get businessId on mount
    useEffect(() => {
        if (!user) return;

        const fetchBusinessId = async () => {
            try {
                const business = await getEmployeeOrganization(user.sub);
                setBusinessId(business.businessId);
            } catch (error) {
                console.error('Failed to load business info', error);
                notifications.show({
                    title: t('notifications.loadFailed.title'),
                    message: t('notifications.loadFailed.message'),
                    color: 'red'
                });
            }
        };

        fetchBusinessId();
    }, [user, t]);

    // Load campaigns when businessId is available
    useEffect(() => {
        if (businessId) {
            loadCampaigns();
        }
    }, [businessId, loadCampaigns]);

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
            loadCampaigns(); // Refresh list
        } catch (error) {
            console.error('Failed to save ad', error);
            notifications.show({
                title: t('notifications.addAd.error.title'),
                message: t('notifications.addAd.error.message'),
                color: 'red'
            });
        }
    };

    const handleDeleteAd = (campaignId: string, adId: string) => {
        setAdToDelete({campaignId, adId});
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!adToDelete) return;

        try {
            await deleteAdFromCampaign(adToDelete.campaignId, adToDelete.adId);
            notifications.show({
                title: t('notifications.deleteAd.success.title'),
                message: t('notifications.deleteAd.success.message'),
                color: 'green'
            });
            loadCampaigns(); // Refresh list
        } catch (error) {
            console.error('Failed to delete ad', error);
            notifications.show({
                title: t('notifications.deleteAd.error.title'),
                message: t('notifications.deleteAd.error.message'),
                color: 'red'
            });
        } finally {
            setConfirmDeleteOpen(false);
            setAdToDelete(null);
        }
    };

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
                cancelLabel={t('confirmations.deleteAd.cancel')}
                confirmColor="red"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDeleteOpen(false)}
            />

        </Stack>
    );
}
