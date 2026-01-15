"use client";

import { MediaRow, MediaRowData } from "./MediaRow";
import { Paper, ScrollArea, Table, Text, Card, Group, Avatar, Badge, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { MediaActions } from "./MediaActions";
import {useTranslations} from "next-intl";

interface MediaTableProps {
  rows: MediaRowData[];
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onToggleStatus?: (id: string | number) => void;
}

export function MediaTable({ rows, onEdit, onDelete, onToggleStatus }: MediaTableProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const t = useTranslations("media.table");

  const statusColorMap: Record<string, string> = {
    ACTIVE: "green",
    PENDING: "yellow",
    REJECTED: "red",
  };

  function getStatusColor(status: string) {
    return statusColorMap[status] ?? "gray";
  }

  if (isMobile) {
    return (
      <Stack gap="md">
        {rows.length > 0 ? (
          rows.map((row) => (
            <Card key={row.id} shadow="sm" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Group>
                  <Avatar src={row.image} alt={row.name} size="md" radius="md" />
                  <div style={{ maxWidth: '180px' }}>
                    <Text fw={500} lineClamp={1}>{row.name}</Text>
                    <Text size="xs" c="dimmed">
                      {row.timeUntil}
                    </Text>
                  </div>
                </Group>
                <MediaActions
                  row={row}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              </Group>

              <Group grow mb="xs">
                <div>
                  <Text size="xs" c="dimmed">Displayed</Text>
                  <Text fw={700} c="blue">{row.adsDisplayed}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Pending</Text>
                  <Text fw={700} c="orange">{row.pending}</Text>
                </div>
              </Group>

              <Group justify="space-between" align="center">
                <Badge color={getStatusColor(row.status)} variant="light">
                  {row.status}
                </Badge>
                <Text fw={600} c="teal">{row.price}</Text>
              </Group>
            </Card>
          ))
        ) : (
          <Text ta="center" c="dimmed" py="xl">
            {t("noMedia")}
          </Text>
        )}
      </Stack>
    );
  }

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
              <Table.Th w={80} miw={60}>{t("image")}</Table.Th>
              <Table.Th miw={120}>{t("name")}</Table.Th>
              <Table.Th miw={100}>{t("displayed")}</Table.Th>
              <Table.Th miw={90}>{t("pending")}</Table.Th>
              <Table.Th miw={140}>{t("status")}</Table.Th>
              <Table.Th miw={100}>{t("update")}</Table.Th>
              <Table.Th w={100} miw={90}>{t("price")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <MediaRow
                  key={row.id}
                  row={row}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text ta="center" c="dimmed" py="xl">
                    {t("noMedia")}
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
