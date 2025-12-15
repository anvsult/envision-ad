"use client";

import { Paper, ScrollArea, Table, Text } from "@mantine/core";
import { ApproveMediaRow, ApproveMediaRowData } from "./ApproveMediaRow";
import { useTranslations } from "next-intl";

interface ApproveMediaTableProps {
    rows: ApproveMediaRowData[];
}

export function ApproveMediaTable({ rows }: ApproveMediaTableProps) {
const t = useTranslations('admin.adminActions');

    return (
        <Paper shadow="sm" radius="md" withBorder>
            <ScrollArea>
                <Table
                    striped
                    highlightOnHover
                    withTableBorder={false}
                    withColumnBorders={false}
                    verticalSpacing="md"
                    horizontalSpacing="lg"
                    layout="auto"
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w={80} miw={60}>{t('image')}</Table.Th>
                            <Table.Th miw={160}>{t('name')}</Table.Th>
                            <Table.Th miw={140}>{t('status')}</Table.Th>
                            <Table.Th w={100} miw={90}>{t('price')}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => <ApproveMediaRow key={row.id} row={row} />)
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={4}>
                                    <Text ta="center" c="dimmed" py="xl">
                                        {t('noMediaPending')}
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
