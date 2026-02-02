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
    requestOrganizationVerification
} from "@/features/organization-management/api";
import {VerificationHistoryTable} from "@/pages/dashboard/organization/ui/tables/VerificationTable";
import {notifications} from "@mantine/notifications";
import {getAccessToken} from "@auth0/nextjs-auth0";
import {jwtDecode} from "jwt-decode";
import {Token} from "@/entities/auth";
import {ConfirmationModal} from "@/shared/ui";

export default function OrganizationDashboard() {
    const {formState, updateField, resetForm, setFormState} = useOrganizationForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [organization, setOrganization] = useState<OrganizationResponseDTO | null>(null);
    const [verifications, setVerifications] = useState<VerificationResponseDTO[]>([]);
    const [loadingOrg, setLoadingOrg] = useState(true);
    const [loadingVerifications, setLoadingVerifications] = useState(false);
    const [requestingVerification, setRequestingVerification] = useState(false);
    const {user} = useUser();

    const [permissions, setPermissions] = useState<string[]>([]);
    const [confirmVerificationRequest, setConfirmVerificationRequest] = useState(false);

    const t = useTranslations("organization");

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

        const fetchPermissions = async () => {
            const token = await getAccessToken();
            const decodedToken = jwtDecode<Token>(token);
            setPermissions(decodedToken.permissions);
        };

        void fetchPermissions();
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
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
                        onSuccess={refreshOrganization}
                        formState={formState}
                        onFieldChange={updateField}
                        resetForm={resetForm}
                        editingId={organization.businessId}
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
                            onSuccess={refreshOrganization}
                            formState={formState}
                            onFieldChange={updateField}
                            resetForm={resetForm}
                            editingId={null}
                        />
                    </Stack>
                </Center>
            )}
        </Stack>
    );
}