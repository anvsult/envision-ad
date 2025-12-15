"use client";

import { Paper, ScrollArea, Table, Text } from "@mantine/core";
import { ApproveMediaRow, ApproveMediaRowData } from "./ApproveMediaRow";

interface ApproveMediaTableProps {
    rows: ApproveMediaRowData[];
}

export function ApproveMediaTable({ rows }: ApproveMediaTableProps) {
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
                            <Table.Th w={80} miw={60}>Image</Table.Th>
                            <Table.Th miw={160}>Name</Table.Th>
                            <Table.Th miw={140}>Status</Table.Th>
                            <Table.Th w={100} miw={90}>Price</Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => <ApproveMediaRow key={row.id} row={row} />)
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={4}>
                                    <Text ta="center" c="dimmed" py="xl">
                                        No pending media to approve.
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
