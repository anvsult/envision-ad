"use client";

import { Avatar, Badge, Table, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export interface ApproveMediaRowData {
    id: string | number;
    name: string;
    image: string | null;
    status: string;
    price: string;
}

interface ApproveMediaRowProps {
    row: ApproveMediaRowData;
}

export function ApproveMediaRow({ row }: ApproveMediaRowProps) {
    const router = useRouter();
    const locale = useLocale();

    const statusColorMap: Record<string, string> = {
        PENDING: "yellow",
        ACTIVE: "green",
        REJECTED: "red",
    };

    const base = `/${locale}/dashboard/admin/medias/pending`;

    return (
        <Table.Tr
            onClick={() => router.push(`${base}/${row.id}`)}
            style={{ cursor: "pointer" }}
        >
            <Table.Td>
                <Avatar src={row.image} alt={row.name} size="md" radius="md" />
            </Table.Td>

            <Table.Td>
                <Text fw={500} size="sm">
                    {row.name}
                </Text>
            </Table.Td>

            <Table.Td>
                <Badge
                    color={statusColorMap[row.status] ?? "gray"}
                    variant="light"
                    size="md"
                    radius="sm"
                >
                    {row.status}
                </Badge>
            </Table.Td>

            <Table.Td>
                <Text size="sm" fw={600} c="teal">
                    {row.price}
                </Text>
            </Table.Td>
        </Table.Tr>
    );
}
