"use client";

import React, { useState } from "react";
import { Stack, Button, Group, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { BusinessTable } from "@/components/Dashboard/Business/BusinessTable/BusinessTable";
import { BusinessModal } from "@/components/Dashboard/Business/BusinessModal/BusinessModal";
import { useBusinessList } from "@/components/Dashboard/Business/hooks/useBusinessList";
import { useBusinessForm } from "@/components/Dashboard/Business/hooks/useBusinessForm";

export function BusinessDashboard() {
    const t = useTranslations("business");
    const { businesses, refreshBusinesses } = useBusinessList();
    const { formState, updateField, resetForm } = useBusinessForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between">
                <Title order={2}>{t("title")}</Title>
                <Button onClick={() => setIsModalOpen(true)}>
                    {t("createButton")}
                </Button>
            </Group>

            <BusinessTable rows={businesses} />

            <BusinessModal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refreshBusinesses}
                formState={formState}
                onFieldChange={updateField}
                resetForm={resetForm}
            />
        </Stack>
    );
}
