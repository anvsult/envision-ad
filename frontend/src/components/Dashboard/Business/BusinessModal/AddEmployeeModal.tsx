"use client";

import React, {useState} from "react";
import {Modal, Button, Group, Stack, TextInput} from "@mantine/core";
import {useTranslations} from "next-intl";
import {inviteEmployeeToBusiness} from "@/services/BusinessService";

interface BusinessModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    email: string
    setEmail: (value: string) => void;
    businessId: string;
}

export function AddEmployeeModal({
                                     opened,
                                     onClose,
                                     onSuccess,
                                     email,
                                     setEmail,
                                     businessId,
                                 }: BusinessModalProps) {
    const t = useTranslations("business.employees.form");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await inviteEmployeeToBusiness(businessId, email);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save business", error);
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
