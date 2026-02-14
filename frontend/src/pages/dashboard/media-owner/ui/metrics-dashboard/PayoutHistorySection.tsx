"use client";

import React from "react";
import { Badge, Group, Pagination, Paper, Table, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import type { PayoutHistoryRow } from "@/pages/dashboard/media-owner/model/mockMetrics";
import { formatCurrency } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/formatting-utils";

interface PayoutHistorySectionProps {
    rows: PayoutHistoryRow[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PayoutHistorySection({
    rows,
    currentPage,
    totalPages,
    onPageChange,
}: PayoutHistorySectionProps) {
    const t = useTranslations("mediaOwnerMetrics");

    return (
        <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="sm">
                {t("sections.payoutHistory")}
            </Text>
            <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t("table.transactionId")}</Table.Th>
                        <Table.Th>{t("table.date")}</Table.Th>
                        <Table.Th ta="right">{t("table.amount")}</Table.Th>
                        <Table.Th>{t("table.status")}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows.map((row) => (
                        <Table.Tr key={row.transactionId}>
                            <Table.Td>{row.transactionId}</Table.Td>
                            <Table.Td>{row.date}</Table.Td>
                            <Table.Td ta="right">{formatCurrency(row.amount)}</Table.Td>
                            <Table.Td>
                                <Badge
                                    size="sm"
                                    radius="sm"
                                    variant="light"
                                    color={row.status === "PAID" ? "teal" : "yellow"}
                                >
                                    {t(`payoutStatus.${row.status.toLowerCase()}`)}
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            {totalPages > 1 && (
                <Group justify="flex-end" mt="md">
                    <Pagination
                        value={currentPage}
                        onChange={onPageChange}
                        total={totalPages}
                        withEdges
                    />
                </Group>
            )}
        </Paper>
    );
}
