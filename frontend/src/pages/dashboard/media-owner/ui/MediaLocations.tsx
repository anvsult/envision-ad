"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTranslations } from 'next-intl';

import { MediaLocation, MediaLocationRequestDTO } from "@/entities/media-location/model/mediaLocation";
import {
    createMediaLocation,
    deleteMediaLocation,
    getAllMediaLocations
} from "@/features/media-location-management/api";
import { getEmployeeOrganization } from "@/features/organization-management/api";

import { MediaLocationsTable } from "@/pages/dashboard/media-owner/ui/tables/MediaLocationsTable";
import { CreateMediaLocationModal } from "@/pages/dashboard/media-owner/ui/modals/CreateMediaLocationModal";
import { EditMediaLocationModal } from "@/pages/dashboard/media-owner/ui/modals/EditMediaLocationModal";
import { AssignMediaModal } from "@/pages/dashboard/media-owner/ui/modals/AssignMediaModal";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import { unassignMediaFromLocation } from "@/features/media-location-management/api";

export default function MediaLocations() {
    const t = useTranslations('mediaLocations');
    const { user } = useUser();

    // State
    const [backendBusinessId, setBackendBusinessId] = useState<string | undefined>();
    const [locations, setLocations] = useState<MediaLocation[]>([]);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<MediaLocation | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignLocationId, setAssignLocationId] = useState<string | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

    // Fetch Business ID
    useEffect(() => {
        if (!user) return;
        const fetchBusinessId = async () => {
            try {
                const business = await getEmployeeOrganization(user.sub);
                if (business) {
                    setBackendBusinessId(business.businessId);
                }
            } catch {
                console.error("Failed to load business info");
            }
        };
        fetchBusinessId();
    }, [user]);

    // Fetch Locations
    const loadLocations = useCallback(async () => {
        if (!backendBusinessId) return;
        try {
            const data = await getAllMediaLocations(backendBusinessId);
            setLocations(data);
        } catch (error) {
            console.error("Failed to load media locations", error);
            notifications.show({
                title: t('notifications.loadFailed.title'),
                message: t('notifications.loadFailed.message'),
                color: "red"
            });
        }
    }, [backendBusinessId, t]);

    useEffect(() => {
        if (backendBusinessId) {
            loadLocations();
        }
    }, [backendBusinessId, loadLocations]);

    // Handlers
    const handleCreateLocation = async (payload: MediaLocationRequestDTO) => {
        if (!backendBusinessId) return;
        try {
            await createMediaLocation({ ...payload, businessId: backendBusinessId });
            notifications.show({
                title: t('notifications.create.success.title'),
                message: t('notifications.create.success.message'),
                color: "green"
            });
            setIsCreateModalOpen(false);
            loadLocations();
        } catch (error) {
            console.error(error);
            notifications.show({
                title: t('notifications.create.error.title'),
                message: t('notifications.create.error.message'),
                color: "red"
            });
        }
    };

    const handleDeleteLocation = (id: string) => {
        setLocationToDelete(id);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!locationToDelete) return;
        try {
            await deleteMediaLocation(locationToDelete);
            notifications.show({
                title: t('notifications.delete.success.title'),
                message: t('notifications.delete.success.message'),
                color: "green"
            });
            loadLocations();
        } catch {
            notifications.show({
                title: t('notifications.delete.error.title'),
                message: t('notifications.delete.error.message'),
                color: "red"
            });
        } finally {
            setConfirmDeleteOpen(false);
            setLocationToDelete(null);
        }
    };

    const handleAssignMedia = (locationId: string) => {
        setAssignLocationId(locationId);
        setIsAssignModalOpen(true);
    };

    const handleAssignSuccess = () => {
        loadLocations();
    };

    const handleEditLocation = (location: MediaLocation) => {
        setLocationToEdit(location);
        setIsEditModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        loadLocations();
    };

    const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);
    const [mediaToUnassign, setMediaToUnassign] = useState<{ locationId: string, mediaId: string } | null>(null);

    const handleUnassignMedia = (locationId: string, mediaId: string) => {
        setMediaToUnassign({ locationId, mediaId });
        setConfirmUnassignOpen(true);
    };

    const confirmUnassign = async () => {
        if (!mediaToUnassign) return;
        try {
            await unassignMediaFromLocation(mediaToUnassign.locationId, mediaToUnassign.mediaId);
            notifications.show({
                title: t('notifications.unassign.success.title'),
                message: t('notifications.unassign.success.message'),
                color: "green"
            });
            loadLocations();
        } catch (error) {
            console.error(error);
            notifications.show({
                title: t('notifications.unassign.error.title'),
                message: t('notifications.unassign.error.message'),
                color: "red"
            });
        } finally {
            setConfirmUnassignOpen(false);
            setMediaToUnassign(null);
        }
    };

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between">
                <Title order={2}>{t('page.title')}</Title>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    {t('page.createButton')}
                </Button>
            </Group>

            <MediaLocationsTable
                locations={locations}
                onDeleteLocation={handleDeleteLocation}
                onAssignMedia={handleAssignMedia}
                onEditLocation={handleEditLocation}
                onUnassignMedia={handleUnassignMedia}
            />

            <CreateMediaLocationModal
                opened={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateLocation}
            />

            <EditMediaLocationModal
                opened={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                location={locationToEdit}
                onSuccess={handleUpdateSuccess}
            />

            <AssignMediaModal
                opened={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                locationId={assignLocationId}
                businessId={backendBusinessId}
                onSuccess={handleAssignSuccess}
            />

            <ConfirmationModal
                opened={confirmDeleteOpen}
                title={t('confirmations.delete.title')}
                message={t('confirmations.delete.message')}
                confirmLabel={t('confirmations.delete.confirm')}
                cancelLabel={t('confirmations.delete.cancel')}
                confirmColor="red"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDeleteOpen(false)}
            />

            <ConfirmationModal
                opened={confirmUnassignOpen}
                title={t('confirmations.unassign.title')}
                message={t('confirmations.unassign.message')}
                confirmLabel={t('confirmations.unassign.confirm')}
                cancelLabel={t('confirmations.unassign.cancel')}
                confirmColor="red"
                onConfirm={confirmUnassign}
                onCancel={() => setConfirmUnassignOpen(false)}
            />
        </Stack>
    );
}
