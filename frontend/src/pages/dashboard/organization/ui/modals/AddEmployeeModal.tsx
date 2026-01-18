"use client";

import React, {useEffect, useState} from "react";
import {Alert, Button, Group, Modal, Stack, TextInput} from "@mantine/core";
import {useTranslations} from "next-intl";
import {createInviteEmployeeToOrganization} from "@/features/organization-management/api";
import {IconInfoCircle} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";

interface BusinessModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    email: string
    setEmail: (value: string) => void;
    organizationId: string;
}

export function AddEmployeeModal({
                                     opened,
                                     onClose,
                                     onSuccess,
                                     email,
                                     setEmail,
                                     organizationId,
                                 }: BusinessModalProps) {
    const t = useTranslations("organization.employees.form");
    const [saving, setSaving] = useState(false);
    const [invalidInputWarning, setInvalidInputWarning] = useState<string | null>(null);

    useEffect(() => {
        if (opened) {
            setInvalidInputWarning(null);
        }
    }, [opened]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSave = async () => {
        if (!email || email.trim() === '') {
            setInvalidInputWarning(t("errors.emailRequired"));
            return;
        }

        if (!validateEmail(email)) {
            setInvalidInputWarning(t("errors.emailInvalid"));
            return;
        }

        setSaving(true);
        try {
            await createInviteEmployeeToOrganization(organizationId, { email });
            setEmail('');
            onSuccess();
            onClose();
            notifications.show({
                title: t("success.title"),
                message: t("success.inviteEmployee"),
                color: "green",
            });
        } catch (error) {
            console.error("Failed to add employee to organization", error);
            notifications.show({
                title: t("errors.error"),
                message: t("errors.saveFailed"),
                color: "red",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t("title")}
            centered
            size="lg"
        >
            <Stack gap="md">
                {invalidInputWarning && (
                    <Alert
                        variant="light"
                        color="red"
                        title={t('errors.validationError')}
                        icon={<IconInfoCircle />}
                        mt="sm"
                    >
                        {invalidInputWarning}
                    </Alert>
                )}
                <TextInput
                    label={t("email")}
                    placeholder={t("placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                />

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
