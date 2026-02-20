"use client";

import React, { useState } from "react";
import { Center, Stack, Title, Text, Button } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useUser } from "@auth0/nextjs-auth0/client";
import { notifications } from "@mantine/notifications";
import { useOrganizationForm } from "@/pages/dashboard/organization/hooks/useOrganizationForm";
import { OrganizationModal } from "@/pages/dashboard/organization/ui/modals/OrganizationModal";
import { createOrganization } from "@/features/organization-management/api";
import { AUTH0_ROLES } from "@/shared/lib/auth/roles";
import { useOrganization, usePermissions } from "@/app/providers";

export default function DashboardPage() {
    const t = useTranslations("organization");
    const { user } = useUser();
    const { organization, refreshOrganization } = useOrganization();
    const { refreshPermissions } = usePermissions();
    const { formState, updateField, resetForm } = useOrganizationForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (organization) return <></>;

    const handleCreate = async () => {
        if (!user?.sub) return;
        try {
            await createOrganization(formState);

            await fetch(`/api/auth0/update-user-roles/${encodeURIComponent(user.sub)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roles: [
                        AUTH0_ROLES.BUSINESS_OWNER,
                        ...(formState.roles.advertiser ? [AUTH0_ROLES.ADVERTISER] : []),
                        ...(formState.roles.mediaOwner ? [AUTH0_ROLES.MEDIA_OWNER] : [])
                    ]
                })
            });

            await refreshPermissions();
            await refreshOrganization();
            setIsModalOpen(false);
            resetForm();
            notifications.show({
                title: t("success.title"),
                message: t("success.create"),
                color: "green",
            });
        } catch (error) {
            console.error("Failed to create organization", error);
            notifications.show({
                title: t("errors.error"),
                message: t("errors.createFailed"),
                color: "red",
            });
        }
    };

    return (
        <Center py="xl">
            <Stack align="center" gap="lg" maw={500}>
                <Stack align="center" gap="xs">
                    <Title order={3} ta="center">{t("noOrganization")}</Title>
                    <Text c="dimmed" ta="center" size="sm">{t("noOrganizationDescription")}</Text>
                </Stack>
                <Button size="md" mt="md" onClick={() => setIsModalOpen(true)}>
                    {t("createOrganization")}
                </Button>
                <OrganizationModal
                    opened={isModalOpen}
                    onClose={() => { setIsModalOpen(false); resetForm(); }}
                    onSave={handleCreate}
                    formState={formState}
                    onFieldChange={updateField}
                    editingId={null}
                />
            </Stack>
        </Center>
    );
}