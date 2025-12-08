"use client";

import React, { useState } from "react";
import { Modal, Button, Group, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";
import { BusinessDetailsForm } from "./BusinessDetailsForm";
import { BusinessRequest } from "@/types/BusinessTypes";
import { createBusiness } from "@/services/BusinessService";

interface BusinessModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    formState: BusinessRequest;
    onFieldChange: <K extends keyof BusinessRequest>(
        field: K,
        value: BusinessRequest[K]
    ) => void;
    resetForm: () => void;
}

export function BusinessModal({
    opened,
    onClose,
    onSuccess,
    formState,
    onFieldChange,
    resetForm,
}: BusinessModalProps) {
    const t = useTranslations("business.form");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await createBusiness(formState);
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error("Failed to create business", error);
            alert("Failed to create business");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title={t("title")} size="lg">
            <Stack gap="md">
                <BusinessDetailsForm formState={formState} onFieldChange={onFieldChange} />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose} disabled={saving}>
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleSave} loading={saving}>
                        {t("submit")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
