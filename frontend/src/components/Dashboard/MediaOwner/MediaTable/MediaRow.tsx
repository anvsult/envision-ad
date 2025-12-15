"use client";

import { Table, Badge, Avatar, Text } from "@mantine/core";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { MediaActions } from "./MediaActions";

export interface MediaRowData {
  id: string | number;
  name: string;
  image: string | null;
  adsDisplayed: number;
  pending: number;
  status: string;
  timeUntil: string;
  price: string;
}

interface MediaRowProps {
  row: MediaRowData;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onToggleStatus?: (id: string | number) => void;
}
export function MediaRow({
  row,
  onEdit,
  onDelete,
  onToggleStatus,
}: MediaRowProps) {
  const [hovered, setHovered] = useState(false);
  const statusColorMap: Record<string, string> = {
    ACTIVE: "green",
    PENDING: "yellow",
    REJECTED: "red",
  };
  function getStatusColor(status: string) {
    return statusColorMap[status] ?? "gray";
  }

  return (
    <Table.Tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }}
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
        <Text size="lg" fw={700} c="blue" ta="center">
          {row.adsDisplayed}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700} c="orange" ta="center">
          {row.pending}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getStatusColor(row.status)}
          variant="light"
          size="md"
          radius="sm"
        >
          {row.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {row.timeUntil}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="teal">
          {row.price}
        </Text>
      </Table.Td>
      {/* ACTIONS COLUMN */}
      <Table.Td w={50} miw={40} ta="center">
        <div
          className="actions-menu"
          style={{
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 150ms ease",
          }}
        >
          <MediaActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        </div>
      </Table.Td>
    </Table.Tr>
  );
}
