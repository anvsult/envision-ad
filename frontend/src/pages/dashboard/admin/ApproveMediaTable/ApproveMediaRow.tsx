"use client";

import { Avatar, Table, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export interface ApproveMediaRowData {
  id: string | number;
  name: string;
  image: string | null;
  location: string;
  mediaOwnerName: string;
  dailyImpressions: number;
  price: string;
}

interface ApproveMediaRowProps {
  row: ApproveMediaRowData;
}

export function ApproveMediaRow({ row }: ApproveMediaRowProps) {
  const router = useRouter();
  const locale = useLocale();

  const base = `/${locale}/dashboard/admin/media/pending`;

  return (
    <Table.Tr
      onClick={() => router.push(`${base}/${row.id}`)}
      style={{ cursor: "pointer" }}
    >
      <Table.Td>
        <Avatar src={row.image} alt={row.name} radius="md" />
      </Table.Td>
      <Table.Td>
        <Text fw={500}>{row.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{row.mediaOwnerName}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{row.location}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{row.dailyImpressions.toLocaleString()}</Text>
      </Table.Td>
      <Table.Td>
        <Text fw={600} c="teal">
          {row.price}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}
