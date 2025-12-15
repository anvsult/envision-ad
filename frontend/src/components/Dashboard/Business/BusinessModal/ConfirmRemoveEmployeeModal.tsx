"use client";

import {Button, Group, Modal, Text} from "@mantine/core";
import {useTranslations} from "next-intl";

interface ConfirmRemoveEmployeeModalProps {
    opened: boolean;
    employeeName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmRemoveEmployeeModal({
                                               opened,
                                               employeeName,
                                               onConfirm,
                                               onCancel
                                           }: ConfirmRemoveEmployeeModalProps) {
    const t = useTranslations("business.employees.modal");

    return (
        <Modal
            opened={opened}
            onClose={onCancel}
            title={t("employeeTitle")}
            centered
        >
            <Text size="sm" component="div">
                {t.rich("employeeMessage", {
                    name: employeeName,
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