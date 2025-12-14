"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

interface ConfirmationModalProps {
    opened: boolean;
    title?: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({
    opened,
    title = "Confirm Action",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmColor = "red",
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onCancel}
            title={title}
            centered
            padding="lg"
        >
            <Text size="sm">
                {message}
            </Text>

            <Group justify="flex-end" mt="lg">
                <Button variant="default" onClick={onCancel}>
                    {cancelLabel}
                </Button>

                <Button color={confirmColor} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </Group>
        </Modal>
    );
}

