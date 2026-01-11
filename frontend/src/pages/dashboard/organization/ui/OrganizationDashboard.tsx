"use client";

import React, {useEffect, useState} from "react";
import {Center, Group, Loader, Stack, Title} from "@mantine/core";
import {OrganizationDetail} from "@/pages/dashboard/organization/ui/tables/OrganizationTable";
import {OrganizationModal} from "@/pages/dashboard/organization/ui/modals/OrganizationModal";
import {useTranslations} from "next-intl";
import {useOrganizationForm} from "@/pages/dashboard/organization/hooks/useOrganizationForm";
import {OrganizationResponseDTO, OrganizationSize} from "@/entities/organization";
import {useUser} from "@auth0/nextjs-auth0/client";
import {getEmployeeOrganization} from "@/features/organization-management/api";

export default function OrganizationDashboard() {
    const {formState, updateField, resetForm, setFormState} = useOrganizationForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [organization, setOrganization] = useState<OrganizationResponseDTO | null>(null);
    const [loadingOrg, setLoadingOrg] = useState(true); // Track organization loading
    const {user} = useUser();

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

        void loadOrganization();
    }, [user]);

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
                </>
            ) : (
                <Center py="xl">
                    <Title order={4}>{t("noOrganization")}</Title>
                </Center>
            )}
        </Stack>
    );
}