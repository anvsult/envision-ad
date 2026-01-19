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
import { useTranslations } from "next-intl";

type Props = {
    rows: MediaRowData[];
    onAddProof: (row: MediaRowData) => void;

    activeAdsCounts?: Record<string, number>;
};

export default function ProofMediaTable({ rows, onAddProof, activeAdsCounts = {} }: Props) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const t = useTranslations("proofOfDisplay");

    const getDisplayedCount = (row: MediaRowData) => {
        const id = String(row.id);
        return activeAdsCounts[id] ?? 0;
    };

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
                                    {t("table.addProof")}
                                </Button>
                            </Group>

                            <Group grow>
                                <Stack gap={0} align="center">
                                    <Text size="xs" c="dimmed">
                                        {t("table.displayed")}
                                    </Text>
                                    <Text fw={700} c="blue">
                                        {getDisplayedCount(row)}
                                    </Text>
                                </Stack>

                                <Stack gap={0} align="center">
                                    <Text size="xs" c="dimmed">
                                        {t("table.pending")}
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
                        {t("table.noMedia")}
                    </Text>
                )}
            </Stack>
        );
    }

    return (
        <Paper shadow="sm" radius="md" withBorder>
            <ScrollArea>
                <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="lg" layout="fixed">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w={80}>{t("table.image")}</Table.Th>
                            <Table.Th>{t("table.name")}</Table.Th>
                            <Table.Th w={140} ta="center">
                                {t("table.adsDisplayed")}
                            </Table.Th>
                            <Table.Th w={120} ta="center">
                                {t("table.pending")}
                            </Table.Th>
                            <Table.Th w={160} ta="right">
                                {t("table.action")}
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
                                            {getDisplayedCount(row)}
                                        </Text>
                                    </Table.Td>

                                    <Table.Td w={120} ta="center">
                                        <Text fw={700} c="orange">
                                            {row.pending}
                                        </Text>
                                    </Table.Td>

                                    <Table.Td w={160} ta="right">
                                        <Button size="xs" variant="light" onClick={() => onAddProof(row)}>
                                            {t("table.addProof")}
                                        </Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <Text ta="center" c="dimmed" py="xl">
                                        {t("table.noMedia")}
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
