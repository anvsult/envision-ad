"use client";

import React, {useState} from "react";
import {Button, Group, Modal, Stack} from "@mantine/core";
import {useTranslations} from "next-intl";
import {OrganizationDetailsForm} from "./OrganizationDetailsForm";
import {OrganizationRequestDTO} from "@/entities/organization";
import {createOrganization, updateOrganization} from "@/features/organization-management/api";

interface OrganizationModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    formState: OrganizationRequestDTO;
    onFieldChange: <K extends keyof OrganizationRequestDTO>(
        field: K,
        value: OrganizationRequestDTO[K]
    ) => void;
    resetForm: () => void;
    editingId: string;
}

export function OrganizationModal({
                                  opened,
                                  onClose,
                                  onSuccess,
                                  formState,
                                  onFieldChange,
                                  resetForm,
                                  editingId,
                              }: OrganizationModalProps) {
    const t = useTranslations("organization.form");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingId) {
                await updateOrganization(editingId, formState);
            } else {
                await createOrganization(formState);
            }
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error("Failed to save organization", error);
            alert(t("saveError"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editingId ? "Edit Business" : t("title")}
            size="lg"
        >
            <Stack gap="md">
                <OrganizationDetailsForm
                    formState={formState}
                    onFieldChange={onFieldChange}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose} disabled={saving}>
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleSave} loading={saving}>
                        {editingId ? "Update" : t("submit")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
