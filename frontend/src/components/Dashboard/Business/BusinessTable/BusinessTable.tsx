"use client";

import React from "react";
import { Table, ScrollArea } from "@mantine/core";
import { useTranslations } from "next-intl";
import { BusinessResponse } from "@/types/BusinessTypes";

interface BusinessTableProps {
    rows: BusinessResponse[];
}

export function BusinessTable({ rows }: BusinessTableProps) {
    const t = useTranslations("business");

    return (
        <ScrollArea>
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t("table.name")}</Table.Th>
                        <Table.Th>{t("table.companySize")}</Table.Th>
                        <Table.Th>{t("table.address")}</Table.Th>
                        <Table.Th>{t("table.dateCreated")}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows.map((row) => (
                        <Table.Tr key={row.id}>
                            <Table.Td>{row.name}</Table.Td>
                            <Table.Td>
                                {/* 
                   row.companySize might be "SMALL" string or enum. 
                   We try to translate sizes.SMALL.
                */}
                                {t(`sizes.${row.companySize}`)}
                            </Table.Td>
                            <Table.Td>
                                {row.address
                                    ? `${row.address.street}, ${row.address.city}, ${row.address.state}`
                                    : "-"}
                            </Table.Td>
                            <Table.Td>
                                {row.dateCreated ? new Date(row.dateCreated).toLocaleDateString() : "-"}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {rows.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
                                No businesses found
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
}
