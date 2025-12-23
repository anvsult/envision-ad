"use client";

import React, {useEffect, useState} from "react";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {Box, Drawer, Group, Paper, Stack, Title} from "@mantine/core";
import {OrganizationDetail} from "@/pages/dashboard/ui/organization/ui/tables/OrganizationTable";
import {OrganizationModal} from "@/pages/dashboard/ui/organization/ui/modals/OrganizationModal";
import {useTranslations} from "next-intl";
import {useOrganizationForm} from "@/pages/dashboard/ui/organization/hooks/useOrganizationForm";
import {OrganizationResponseDTO, OrganizationSize} from "@/entities/organization";
import {useUser} from "@auth0/nextjs-auth0";
import {getEmployeeOrganization} from "@/features/organization-management/api";
import SideBar from "@/components/SideBar/SideBar";

export default function OrganizationDashboard() {
    const [opened, {toggle, close}] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const {formState, updateField, resetForm, setFormState} = useOrganizationForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [organization, setOrganization] = useState<OrganizationResponseDTO | null>(null);
    const {user} = useUser();

    const loadOrganization = async () => {
        const organization = await getEmployeeOrganization(user!.sub);
        setOrganization(organization);
    };

    useEffect(() => {
        if (!user?.sub) return;

        const loadOrganization = async () => {
            const organization = await getEmployeeOrganization(user.sub);
            setOrganization(organization);
        };

        loadOrganization();
    }, [user?.sub]);

    const t = useTranslations("organization");

    const handleEdit = async (id: string | number) => {
        try {
            // Map OrganizationResponse to OrganizationRequest format
            setFormState({
                name: organization!.name ?? "",
                organizationSize:
                    (typeof organization!.organizationSize === "string"
                        ? OrganizationSize[organization!.organizationSize as keyof typeof OrganizationSize]
                        : organization!.organizationSize) ?? OrganizationSize.SMALL,
                address: {
                    street: organization!.address?.street ?? "",
                    city: organization!.address?.city ?? "",
                    state: organization!.address?.state ?? "",
                    zipCode: organization!.address?.zipCode ?? "",
                    country: organization!.address?.country ?? ""
                },
                roles: {
                    advertiser: organization!.roles.advertiser ?? false,
                    mediaOwner: organization!.roles.mediaOwner ?? false
                }
            });
            setIsModalOpen(true);
        } catch (err) {
            //This should be using translated values
            console.error("Failed to fetch organization for edit:", err);
            alert("Failed to load organization for editing");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Box>
                <Drawer
                    opened={opened}
                    onClose={close}
                    size="xs"
                    padding="md"
                    hiddenFrom="md"
                    zIndex={1000}
                >
                    <SideBar></SideBar>
                </Drawer>

                <Group align="flex-start" gap={0} wrap="nowrap">
                    {!isMobile && (
                        <Paper
                            w={250}
                            p="md"
                            style={{minHeight: "calc(100vh - 80px)", borderRadius: 0}}
                            withBorder
                        >
                            <SideBar></SideBar>
                        </Paper>
                    )}

                    <div style={{flex: 1, minWidth: 0}}>
                        <Stack gap="md" p="md">
                            <Group justify="space-between">
                                <Title order={2}>{t("title")}</Title>
                            </Group>

                            {organization && (
                                <>
                                    <OrganizationDetail
                                        organization={organization}
                                        onEdit={handleEdit}
                                    />

                                    <OrganizationModal
                                        opened={isModalOpen}
                                        onClose={handleCloseModal}
                                        onSuccess={loadOrganization}
                                        formState={formState}
                                        onFieldChange={updateField}
                                        resetForm={resetForm}
                                        editingId={organization.organizationId}
                                    />
                                </>
                            )}
                        </Stack>
                    </div>
                </Group>
            </Box>
        </>
    );
}
