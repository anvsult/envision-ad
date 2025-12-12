"use client";

import {MediaRow, MediaRowData} from "./MediaRow";
import {Paper, ScrollArea, Table, Text} from "@mantine/core";

interface MediaTableProps {
    rows: MediaRowData[];
    onEdit?: (id: string | number) => void;
    onDelete?: (id: string | number) => void;
}

export function MediaTable({rows, onEdit, onDelete}: MediaTableProps) {
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
                            <Table.Th miw={120}>Name</Table.Th>
                            <Table.Th miw={100}>Ads displayed</Table.Th>
                            <Table.Th miw={90}>Ads pending</Table.Th>
                            <Table.Th miw={140}>Status</Table.Th>
                            <Table.Th miw={100}>Next update</Table.Th>
                            <Table.Th w={100} miw={90}>Price</Table.Th>
                            <Table.Th w={120} miw={120}>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => (
                                <MediaRow key={row.id} row={row} onEdit={onEdit} onDelete={onDelete}/>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={8}>
                                    <Text ta="center" c="dimmed" py="xl">
                                        No media found. Add your first media to get started.
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
