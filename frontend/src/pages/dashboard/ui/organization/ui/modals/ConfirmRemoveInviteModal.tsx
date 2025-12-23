"use client";

import {Button, Group, Modal, Text} from "@mantine/core";
import {useTranslations} from "next-intl";

interface ConfirmRemoveInviteModalProps {
    opened: boolean;
    email: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmRemoveInviteModal({
                                               opened,
                                               email,
                                               onConfirm,
                                               onCancel
                                           }: ConfirmRemoveInviteModalProps) {
    const t = useTranslations("business.employees.modal");

    return (
        <Modal
            opened={opened}
            onClose={onCancel}
            title={t("invitationTitle")}
            centered
        >
            <Text size="sm" component="div">
                {t.rich("invitationMessage", {
                    email: email,
                    bold: (chunks) => <strong>{chunks}</strong>
                })}
            </Text>

            <Group justify="flex-end" mt="lg">
                <Button variant="default" onClick={onCancel}>
                    {t("cancel")}
                </Button>

                <Button color="red" onClick={onConfirm}>
                    {t("confirm")}
                </Button>
            </Group>
        </Modal>
    );
}