"use client";

import {Button, Group, Modal, Text} from "@mantine/core";

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
    return (
        <Modal
            opened={opened}
            onClose={onCancel}
            title="Confirm Removal"
            centered
        >
            <Text size="sm">
                Are you sure you want to remove <strong>{employeeName}</strong> from your business?
            </Text>

            <Group justify="flex-end" mt="lg">
                <Button variant="default" onClick={onCancel}>
                    Cancel
                </Button>

                <Button color="red" onClick={onConfirm}>
                    Remove
                </Button>
            </Group>
        </Modal>
    );
}