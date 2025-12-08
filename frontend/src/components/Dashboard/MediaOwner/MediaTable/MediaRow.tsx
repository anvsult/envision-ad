"use client";

import { Table, Badge, ActionIcon, Group, Avatar, Text, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";

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
}

export function MediaRow({ row, onEdit, onDelete }: MediaRowProps) {
  return (
    <Table.Tr>
      <Table.Td>
        <Avatar 
          src={row.image} 
          alt={row.name} 
          size="md" 
          radius="md"
        />
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
          color={row.status === "Active" ? "green" : "gray"}
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
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Edit media">
            <ActionIcon
              variant="light"
              color="blue"
              size="md"
              onClick={() => onEdit && onEdit(row.id)}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete media">
            <ActionIcon
              variant="light"
              color="red"
              size="md"
              onClick={() => onDelete && onDelete(row.id)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
