"use client";

import React, {useState, useEffect} from "react";
import {Alert, Button, Group, Modal, Stack} from "@mantine/core";
import {useTranslations} from "next-intl";
import {OrganizationDetailsForm} from "./OrganizationDetailsForm";
import {OrganizationRequestDTO} from "@/entities/organization";
import {createOrganization, updateOrganization} from "@/features/organization-management/api";
import {notifications} from "@mantine/notifications";
import {IconInfoCircle} from "@tabler/icons-react";

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
    editingId: string | null;
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
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (opened) {
            setValidationError(null);
        }
    }, [opened]);

    const validateForm = (): boolean => {
        if (!formState.name || formState.name.trim() === '') {
            setValidationError(t("errors.nameRequired"));
            return false;
        }

        if (!formState.organizationSize) {
            setValidationError(t("errors.sizeRequired"));
            return false;
        }

        if (!formState.address.street || formState.address.street.trim() === '') {
            setValidationError(t("errors.streetRequired"));
            return false;
        }

        if (!formState.address.city || formState.address.city.trim() === '') {
            setValidationError(t("errors.cityRequired"));
            return false;
        }

        if (!formState.address.state || formState.address.state.trim() === '') {
            setValidationError(t("errors.stateRequired"));
            return false;
        }

        if (!formState.address.zipCode || formState.address.zipCode.trim() === '') {
            setValidationError(t("errors.zipRequired"));
            return false;
        }

        if (!formState.address.country || formState.address.country.trim() === '') {
            setValidationError(t("errors.countryRequired"));
            return false;
        }

        if (!formState.roles.advertiser && !formState.roles.mediaOwner) {
            setValidationError(t("errors.roleRequired"));
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        setValidationError(null);

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await updateOrganization(editingId, formState);
                notifications.show({
                    title: t("success.title"),
                    message: t("success.update"),
                    color: "green",
                });
            } else {
                await createOrganization(formState);
                notifications.show({
                    title: t("success.title"),
                    message: t("success.create"),
                    color: "green",
                });
            }
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            if (editingId) {
                console.error("Failed to update organization", error);
                notifications.show({
                    title: t("errors.error"),
                    message: t("errors.updateFailed"),
                    color: "red",
                });
            } else {
                console.error("Failed to create organization", error);
                notifications.show({
                    title: t("errors.error"),
                    message: t("errors.createFailed"),
                    color: "red",
                });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editingId ? t("editTitle") : t("createTitle")}
            size="lg"
            centered
        >
            <Stack gap="md">
                {validationError && (
                    <Alert
                        variant="light"
                        color="red"
                        title={t("errors.validationError")}
                        icon={<IconInfoCircle />}
                    >
                        {validationError}
                    </Alert>
                )}

                <OrganizationDetailsForm
                    formState={formState}
                    onFieldChange={onFieldChange}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose} disabled={saving}>
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleSave} loading={saving}>
                        {editingId ? t("update") : t("create")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}