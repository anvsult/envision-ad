"use client";

import React, {useState} from "react";
import {Button, Group, Modal, Stack, TextInput} from "@mantine/core";
import {useTranslations} from "next-intl";
import {createInviteEmployeeToOrganization} from "@/features/organization-management/api";

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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSave = async () => {
        if (!email || email.trim() === '') {
            alert(t("emailRequired"));
            return;
        }

        if (!validateEmail(email)) {
            alert(t("invalidEmailFormat"));
            return;
        }

        setSaving(true);
        try {
            await createInviteEmployeeToOrganization(organizationId, { email });
            onSuccess();
            onClose();
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
            title={t("title")}
            size="lg"
        >
            <Stack gap="md">
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
