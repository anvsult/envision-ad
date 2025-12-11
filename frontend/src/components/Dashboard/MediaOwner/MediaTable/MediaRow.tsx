"use client";

import { Table, Badge, ActionIcon, Avatar, Text, Menu, Group, Modal, Button, Tooltip, } from "@mantine/core";
import { IconEdit, IconTrash, IconMenu2 } from "@tabler/icons-react";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconPower, IconClock } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

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
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [pendingAction, setPendingAction] = useState<
    "activate" | "deactivate" | null
  >(null);
  const t = useTranslations("media");
  const statusColorMap: Record<string, string> = {
    ACTIVE: "green",
    PENDING: "yellow",
    REJECTED: "red",
  };
  function getStatusColor(status: string) {
    return statusColorMap[status] ?? "gray";
  }

  const isActivating = pendingAction === "activate";

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
          <Menu withinPortal position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                radius="xl"
                aria-label="Open media actions"
              >
                <IconMenu2 size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{t("actionsMenu.title")}</Menu.Label>

              {/* Edit */}
              {onEdit && (
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => onEdit(row.id)}
                >
                  {t("actionsMenu.edit")}
                </Menu.Item>
              )}

              {/* Toggle Status Menu Item */}
              {row.status === "PENDING" || row.status === "REJECTED" ? (
                <Tooltip
                  label={
                    row.status === "PENDING"
                      ? t("changeStatus.pendingToolTip")
                      : t("changeStatus.rejectedToolTip")
                  }
                  withArrow
                  position="left"
                >
                  <Menu.Item
                    leftSection={<IconClock size={14} />}
                    disabled
                    style={{ opacity: 0.6 }}
                  >
                    {row.status === "PENDING"
                      ? t("changeStatus.waitApproval")
                      : t("changeStatus.rejected")}
                  </Menu.Item>
                </Tooltip>
              ) : (
                // Active/Inactive
                <Menu.Item
                  leftSection={<IconPower size={14} />}
                  onClick={() => {
                    const action =
                      row.status === "ACTIVE" ? "deactivate" : "activate";
                    setPendingAction(action as "activate" | "deactivate");
                    openModal();
                  }}
                >
                  {row.status === "ACTIVE"
                    ? t("changeStatus.deactivate")
                    : t("changeStatus.activate")}
                </Menu.Item>
              )}

              <Menu.Divider />
              <Menu.Label>{t("actionsMenu.dangerZone")}</Menu.Label>

              {/* Delete */}
              {onDelete && (
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => onDelete(row.id)}
                >
                  {t("actionsMenu.deleteMedia")}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </div>
      </Table.Td>

      <Modal
          opened={modalOpened}
          onClose={closeModal}
          centered
          title={
            isActivating
                ? `${t("changeStatus.activate")} ${row.name}`
                : `${t("changeStatus.deactivate")} ${row.name}`
          }
      >
        <Text mb="md">
          {isActivating
              ? t("changeStatus.activateModalMessage")
              : t("changeStatus.deactivateModalMessage")}
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={closeModal}>
            {t("actionsMenu.cancel")}
          </Button>

          <Button
              color={isActivating ? "green" : "red"}
              onClick={() => {
                closeModal();
                onToggleStatus?.(row.id);
              }}
          >
            {isActivating
                ? t("changeStatus.activate")
                : t("changeStatus.deactivate")}
          </Button>
        </Group>
      </Modal>

    </Table.Tr>
  );
}
