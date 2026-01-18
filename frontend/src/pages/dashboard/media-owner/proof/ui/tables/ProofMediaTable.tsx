"use client";

import type { MediaRowData } from "../../../ui/tables/MediaRow";
import {
    Paper,
    ScrollArea,
    Table,
    Text,
    Button,
    Avatar,
    Group,
    Card,
    Stack,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

type Props = {
    rows: MediaRowData[];
    onAddProof: (row: MediaRowData) => void;
};

export default function ProofMediaTable({ rows, onAddProof }: Props) {
    const isMobile = useMediaQuery("(max-width: 768px)");

    if (isMobile) {
        return (
            <Stack gap="md">
                {rows.length ? (
                    rows.map((row) => (
                        <Card key={String(row.id)} shadow="sm" radius="md" withBorder>
                            <Group justify="space-between" align="center" mb="sm">
                                <Group gap="sm">
                                    <Avatar src={row.image} alt={row.name} size="md" radius="md" />
                                    <Text fw={500} lineClamp={1}>
                                        {row.name}
                                    </Text>
                                </Group>

                                <Button size="xs" variant="light" onClick={() => onAddProof(row)}>
                                    Add proof
                                </Button>
                            </Group>
                            <Group grow>
                                <Stack gap={0} align="center">
                                    <Text size="xs" c="dimmed">
                                        Displayed
                                    </Text>
                                    <Text fw={700} c="blue">
                                        {row.adsDisplayed}
                                    </Text>
                                </Stack>

                                <Stack gap={0} align="center">
                                    <Text size="xs" c="dimmed">
                                        Pending
                                    </Text>
                                    <Text fw={700} c="orange">
                                        {row.pending}
                                    </Text>
                                </Stack>
                            </Group>
                        </Card>
                    ))
                ) : (
                    <Text ta="center" c="dimmed" py="xl">
                        No media found
                    </Text>
                )}
            </Stack>
        );
    }

    return (
        <Paper shadow="sm" radius="md" withBorder>
            <ScrollArea>
                <Table
                    striped
                    highlightOnHover
                    verticalSpacing="md"
                    horizontalSpacing="lg"
                    layout="fixed"
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w={80}>Image</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th w={140} ta="center">
                                Ads displayed
                            </Table.Th>
                            <Table.Th w={120} ta="center">
                                Pending
                            </Table.Th>
                            <Table.Th w={160} ta="right">
                                Action
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {rows.length ? (
                            rows.map((row) => (
                                <Table.Tr key={String(row.id)}>
                                    <Table.Td w={80}>
                                        <Avatar src={row.image} alt={row.name} size="md" radius="md" />
                                    </Table.Td>

                                    <Table.Td>
                                        <Text fw={500} lineClamp={1}>
                                            {row.name}
                                        </Text>
                                    </Table.Td>

                                    <Table.Td w={140} ta="center">
                                        <Text fw={700} c="blue">
                                            {row.adsDisplayed}
                                        </Text>
                                    </Table.Td>

                                    <Table.Td w={120} ta="center">
                                        <Text fw={700} c="orange">
                                            {row.pending}
                                        </Text>
                                    </Table.Td>

                                    <Table.Td w={160} ta="right">
                                        <Button size="xs" variant="light" onClick={() => onAddProof(row)}>
                                            Add proof
                                        </Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <Text ta="center" c="dimmed" py="xl">
                                        No media found
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Paper>
    );
}
