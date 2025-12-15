import React from "react";
import {Accordion, ActionIcon, Group, ScrollArea, Table, Tooltip} from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";
import {useTranslations} from "next-intl";
import type {InvitationResponse} from "@/types/InvitationType";

interface InvitationTableProps {
    invitations: InvitationResponse[];
    onDelete?: (employee: InvitationResponse) => void;
}

export function InvitationTable({invitations, onDelete,}: InvitationTableProps) {
    const t = useTranslations("business.employees");

    const getTimeLeft = (expiryDate: string) => {
        const now = new Date();
        const expires = new Date(expiryDate);
        const diffMs = expires.getTime() - now.getTime();

        // If already expired
        if (diffMs <= 0) {
            return "Expired";
        }

        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `${diffDays}d`;
        } else if (diffHours > 0) {
            return `${diffHours}h`;
        } else {
            return `${diffMinutes}m`;
        }
    };

    return (
        <Accordion.Item value="invites">
            <Accordion.Control>{t("invites")}</Accordion.Control>

            <Accordion.Panel>
                <ScrollArea>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: "40%" }}>{t("email")}</Table.Th>
                                <Table.Th style={{ width: "40%" }}>{t("expire")}</Table.Th>
                                <Table.Th style={{ width: "20%", textAlign: "right"}}>{t("actions")}</Table.Th>
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {invitations.map((inv) => (
                                <Table.Tr key={inv.invitationId}>
                                    <Table.Td>{inv.email}</Table.Td>
                                    <Table.Td>{getTimeLeft(inv.timeExpires)}</Table.Td>
                                    <Table.Td>
                                        <Group gap="xs" wrap="nowrap" justify="flex-end">
                                                <Tooltip label="Delete employee">
                                                    <ActionIcon
                                                        variant="light"
                                                        color="red"
                                                        size="md"
                                                        onClick={() => onDelete?.(inv)}
                                                    >
                                                        <IconTrash size={16}/>
                                                    </ActionIcon>
                                                </Tooltip>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}

                            {invitations.length === 0 && (
                                <Table.Tr>
                                    <Table.Td colSpan={3} style={{textAlign: "center"}}>
                                        {t("invitationNotFound")}
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>


            </Accordion.Panel>
        </Accordion.Item>

    );
}