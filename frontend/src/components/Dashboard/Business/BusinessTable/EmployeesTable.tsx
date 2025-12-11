import React from "react";
import {Table, ScrollArea, ActionIcon, Group, Tooltip, Accordion} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import {useTranslations} from "next-intl";

interface EmployeeTableProps {
    employees: UserType[];
    onDelete?: (id: string) => void;
    currentUserId: string;
    ownerId: string;
}

export function EmployeeTable({ employees, onDelete, currentUserId, ownerId }: EmployeeTableProps) {
    const t = useTranslations("business.employees");

    return (
        <Accordion variant="separated" defaultValue="active">
            <Accordion.Item value="active">
                <Accordion.Control>{t("active")}</Accordion.Control>

                <Accordion.Panel>
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t("name")}</Table.Th>
                                    <Table.Th>{t("email")}</Table.Th>
                                    <Table.Th style={{ textAlign: "right" }}>{t("actions")}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>
                                {employees.map((emp) => (
                                    <Table.Tr key={emp.user_id}>
                                        <Table.Td>{emp.name}</Table.Td>
                                        <Table.Td>{emp.email}</Table.Td>
                                        <Table.Td>
                                            <Group gap="xs" wrap="nowrap" justify="flex-end">
                                                { currentUserId !== emp.user_id && ownerId === currentUserId &&
                                                    <Tooltip label="Delete employee">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            size="md"
                                                            onClick={() => onDelete?.(emp.user_id)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                }
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}

                                {employees.length === 0 && (
                                    <Table.Tr>
                                        <Table.Td colSpan={3} style={{ textAlign: "center" }}>
                                            No employees found
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}