import React from "react";
import { Table, ScrollArea, ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { BusinessResponse } from "@/entities/businesses/model";

interface BusinessTableProps {
  rows: BusinessResponse[];
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

export function BusinessTable({ rows, onEdit, onDelete }: BusinessTableProps) {
  const t = useTranslations("businesses");

  return (
    <ScrollArea>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("table.name")}</Table.Th>
            <Table.Th>{t("table.companySize")}</Table.Th>
            <Table.Th>{t("table.address")}</Table.Th>
            <Table.Th>{t("table.dateCreated")}</Table.Th>
            <Table.Th>{t("table.actions")}</Table.Th>
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
                {row.dateCreated
                  ? new Date(row.dateCreated).toLocaleDateString()
                  : "-"}
              </Table.Td>
              <Table.Td>
                <Group gap="xs" wrap="nowrap">
                  <Tooltip label="Edit business">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="md"
                      onClick={() => onEdit && onEdit(row.id)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete business">
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
          ))}
          {rows.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                No businesses found
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
