import { Group, Stack, Text } from "@mantine/core";
import React from "react";

/**
 * Props for the InfoRow component.
 */
interface InfoRowProps {
    /** The label text to display above the value. */
    label: string;
    /** The value to display below the label. Can be any valid React node. */
    value: React.ReactNode;
}

/**
 * A reusable component to display a labeled piece of information.
 * Typically used in profile or detail views.
 *
 * @param {InfoRowProps} props - The props for the component.
 * @returns {JSX.Element} The rendered InfoRow component.
 */
export const InfoRow = ({ label, value }: InfoRowProps) => (
    <Group justify="space-between" align="center" py="xs">
        <Stack gap={2}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">{label}</Text>
            <Text size="sm" fw={500} component="div">{value}</Text>
        </Stack>
    </Group>
);
