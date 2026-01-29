"use client";

import React, {useEffect, useState} from "react";
import {Button, Center, Group, Loader, Stack, Title, Text} from "@mantine/core";
import {OrganizationDetail} from "@/pages/dashboard/organization/ui/tables/OrganizationTable";
import {OrganizationModal} from "@/pages/dashboard/organization/ui/modals/OrganizationModal";
import {useTranslations} from "next-intl";
import {useOrganizationForm} from "@/pages/dashboard/organization/hooks/useOrganizationForm";
import {OrganizationResponseDTO, OrganizationSize} from "@/entities/organization";
import {VerificationResponseDTO} from "@/entities/organization/model/verification";
import {useUser} from "@auth0/nextjs-auth0/client";
import {
    getAllOrganizationVerifications,
    getEmployeeOrganization,
    requestOrganizationVerification,
    createOrganization,
    updateOrganization, getAllOrganizationEmployees
} from "@/features/organization-management/api";
import {VerificationHistoryTable} from "@/pages/dashboard/organization/ui/tables/VerificationTable";
import {notifications} from "@mantine/notifications";
import {ConfirmationModal} from "@/shared/ui";
import {AUTH0_ROLES} from "@/shared/lib/auth/roles";
import {usePermissions} from "@/app/providers";

export default function OrganizationDashboard() {
    const {formState, updateField, resetForm, setFormState} = useOrganizationForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [organization, setOrganization] = useState<OrganizationResponseDTO | null>(null);
    const [verifications, setVerifications] = useState<VerificationResponseDTO[]>([]);
    const [loadingOrg, setLoadingOrg] = useState(true);
    const [loadingVerifications, setLoadingVerifications] = useState(false);
    const [requestingVerification, setRequestingVerification] = useState(false);
    const {user} = useUser();

    const { permissions, refreshPermissions } = usePermissions();
    const [confirmVerificationRequest, setConfirmVerificationRequest] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const t = useTranslations("organization");
    const tForm = useTranslations("organization.form"); //TODO move the translations

    useEffect(() => {
        if (!user?.sub) return;

        const loadOrganization = async () => {
            try {
                setLoadingOrg(true);
                const organization = await getEmployeeOrganization(user.sub);
                setOrganization(organization);
            } catch (error) {
                console.error("Failed to load organization", error);
            } finally {
                setLoadingOrg(false);
            }
        };

        void loadOrganization();
    }, [user?.sub]);

    useEffect(() => {
        if (!organization?.businessId || !permissions.includes('read:verification') || !permissions.includes('create:verification')) return;

        const loadVerifications = async () => {
            try {
                setLoadingVerifications(true);
                const verificationHistory = await getAllOrganizationVerifications(organization.businessId);
                setVerifications(verificationHistory);
            } catch (error) {
                console.error("Failed to load verification history", error);
            } finally {
                setLoadingVerifications(false);
            }
        };

        void loadVerifications();
    }, [organization?.businessId, permissions]);

    const refreshOrganization = async () => {
        try {
            const organization = await getEmployeeOrganization(user!.sub);
            setOrganization(organization);
        } catch (error) {
            console.error("Failed to refresh organization", error);
        }
    };

    const handleEdit = async () => {
        if (!organization) return;

        setFormState({
            name: organization.name ?? "",
            organizationSize:
                (typeof organization.organizationSize === "string"
                    ? OrganizationSize[organization.organizationSize as keyof typeof OrganizationSize]
                    : organization.organizationSize) ?? OrganizationSize.SMALL,
            address: {
                street: organization.address?.street ?? "",
                city: organization.address?.city ?? "",
                state: organization.address?.state ?? "",
                zipCode: organization.address?.zipCode ?? "",
                country: organization.address?.country ?? ""
            },
            roles: {
                advertiser: organization.roles.advertiser ?? false,
                mediaOwner: organization.roles.mediaOwner ?? false
            }
        });
        setEditingId(organization.businessId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await updateOrganization(editingId, formState);

                const roleChanges = {
                    toRemove: [
                        organization?.roles.advertiser && !formState.roles.advertiser && AUTH0_ROLES.ADVERTISER,
                        organization?.roles.mediaOwner && !formState.roles.mediaOwner && AUTH0_ROLES.MEDIA_OWNER,
                    ].filter(Boolean) as string[],
                    toAdd: [
                        !organization?.roles.advertiser && formState.roles.advertiser && AUTH0_ROLES.ADVERTISER,
                        !organization?.roles.mediaOwner && formState.roles.mediaOwner && AUTH0_ROLES.MEDIA_OWNER,
                    ].filter(Boolean) as string[],
                };

                const employees = await getAllOrganizationEmployees(editingId);

                if (roleChanges.toRemove.length > 0 || roleChanges.toAdd.length > 0) {
                    await Promise.all(
                        employees.map(async (employee) => {
                            const encodedUserId = encodeURIComponent(employee.user_id);

                            if (roleChanges.toRemove.length > 0) {
                                await fetch(`/api/auth0/update-user-roles/${encodedUserId}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ roles: roleChanges.toRemove })
                                });
                            }

                            if (roleChanges.toAdd.length > 0) {
                                await fetch(`/api/auth0/update-user-roles/${encodedUserId}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ roles: roleChanges.toAdd })
                                });
                            }
                        })
                    );

                    await refreshPermissions();
                }

                notifications.show({
                    title: tForm("success.title"),
                    message: tForm("success.update"),
                    color: "green",
                });
            } else {
                await createOrganization(formState);

                await fetch(`/api/auth0/update-user-roles/${encodeURIComponent(user!.sub)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({roles: [
                            AUTH0_ROLES.BUSINESS_OWNER,
                            ...(formState.roles.advertiser ? [AUTH0_ROLES.ADVERTISER] : []),
                            ...(formState.roles.mediaOwner ? [AUTH0_ROLES.MEDIA_OWNER] : [])
                        ]})
                });

                await refreshPermissions();

                notifications.show({
                    title: tForm("success.title"),
                    message: tForm("success.create"),
                    color: "green",
                });
            }

            await refreshOrganization();
            handleCloseModal();
            resetForm();
        } catch (error) {
            if (editingId) {
                console.error("Failed to update organization", error);
                notifications.show({
                    title: tForm("errors.error"),
                    message: tForm("errors.updateFailed"),
                    color: "red",
                });
            } else {
                console.error("Failed to create organization", error);
                notifications.show({
                    title: tForm("errors.error"),
                    message: tForm("errors.createFailed"),
                    color: "red",
                });
            }
            throw error;
        }
    };

    const handleRequestVerification = async () => {
        if (!organization?.businessId) return;

        try {
            setRequestingVerification(true);
            await requestOrganizationVerification(organization.businessId);
            const verificationHistory = await getAllOrganizationVerifications(organization.businessId);
            setVerifications(verificationHistory);
            setConfirmVerificationRequest(false);
            notifications.show({
                title: t('success.title'),
                message: t('success.verificationRequest'),
                color: 'green'
            });
        } catch (error) {
            console.error("Failed to request verification", error);
            notifications.show({
                title: t('errors.title'),
                message: t('errors.verificationRequestFailed'),
                color: 'red'
            });
        } finally {
            setRequestingVerification(false);
        }
    };

    const isVerified = organization?.verified ?? false;
    const hasPendingVerification = verifications.some(v => v.status === "PENDING");
    const canRequestVerification = !isVerified && !hasPendingVerification;

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between">
                <Title order={2}>{t("title")}</Title>
            </Group>

            {loadingOrg ? (
                <Center py="xl">
                    <Loader/>
                </Center>
            ) : organization ? (
                <>
                    <OrganizationDetail
                        organization={organization}
                        onEdit={handleEdit}
                    />

                    <OrganizationModal
                        opened={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSave}
                        formState={formState}
                        onFieldChange={updateField}
                        editingId={editingId}
                    />

                    { (permissions.includes('read:verification') || permissions.includes('create:verification')) &&
                        <Stack gap="md">
                            <Group justify="space-between" align="center">
                                <Title order={3}>{t("verificationHistory")}</Title>
                                <Button
                                    onClick={() => setConfirmVerificationRequest(true)}
                                    disabled={!canRequestVerification}
                                    loading={requestingVerification}
                                >
                                    {t("requestVerification")}
                                </Button>
                            </Group>

                            <ConfirmationModal
                                opened={confirmVerificationRequest}
                                title={t("modal.verification")}
                                message={t("modal.verificationMessage")}
                                cancelLabel={t("modal.cancel")}
                                confirmLabel={t("modal.confirm")}
                                confirmColor="green"
                                onCancel={() => setConfirmVerificationRequest(false)}
                                onConfirm={handleRequestVerification}
                            />

                            {loadingVerifications ? (
                                <Center py="xl">
                                    <Loader size="sm" />
                                </Center>
                            ) : (
                                <VerificationHistoryTable verifications={verifications} />
                            )}
                        </Stack>
                    }
                </>
            ) : (
                <Center py="xl">
                    <Stack align="center" gap="lg" maw={500}>
                        <Stack align="center" gap="xs">
                            <Title order={3} ta="center">
                                {t("noOrganization")}
                            </Title>
                            <Text c="dimmed" ta="center" size="sm">
                                {t("noOrganizationDescription")}
                            </Text>
                        </Stack>

                        <Button
                            onClick={() => setIsModalOpen(true)}
                            size="md"
                            mt="md"
                        >
                            {t("createOrganization")}
                        </Button>

                        <OrganizationModal
                            opened={isModalOpen}
                            onClose={handleCloseModal}
                            onSave={handleSave}
                            formState={formState}
                            onFieldChange={updateField}
                            editingId={editingId}
                        />
                    </Stack>
                </Center>
            )}
        </Stack>
    );
}