"use client";

import React, { useEffect, useState } from "react";
import { Accordion, Button, Group, Stack, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { AddEmployeeModal } from "@/pages/dashboard/organization/ui/modals/AddEmployeeModal";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
    cancelInviteEmployeeToOrganization,
    getAllOrganizationEmployees,
    getAllOrganizationInvitations,
    getEmployeeOrganization,
    removeEmployeeFromOrganization
} from "@/features/organization-management/api";
import { EmployeeTable } from "@/pages/dashboard/organization/ui/tables/EmployeesTable";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import type { Employee } from "@/entities/organization";
import { InvitationResponse } from "@/entities/organization";
import { InvitationTable } from "@/pages/dashboard/organization/ui/tables/InvitationsTable";
import { notifications } from "@mantine/notifications";

export default function OrganizationEmployees() {
    const [owner, setOwner] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [confirmEmployeeOpen, setConfirmEmployeeOpen] = useState(false);
    const [confirmInviteOpen, setConfirmInviteOpen] = useState(false);
    const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);
    const [invitationToRemove, setInvitationToRemove] = useState<InvitationResponse | null>(null);

    const t = useTranslations("organization.employees");
    const { user } = useUser();

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSuccess = async () => {
        setIsModalOpen(false);

        if (organizationId)
            setInvitations(await getAllOrganizationInvitations(organizationId));
    };

    const handleDeleteEmployee = (employee: Employee) => {
        setEmployeeToRemove(employee);
        setConfirmEmployeeOpen(true);
    };

    const handleDeleteInvitation = (invitation: InvitationResponse) => {
        setInvitationToRemove(invitation);
        setConfirmInviteOpen(true);
    };

    const confirmEmployeeRemove = async () => {
        if (!employeeToRemove || !organizationId) return;

        try {
            await removeEmployeeFromOrganization(organizationId, employeeToRemove.employee_id!);

            setEmployees((prev) =>
                prev.filter((e) => e.employee_id !== employeeToRemove.employee_id)
            );

            notifications.show({
                title: t("success.title"),
                message: t("success.deleteEmployee"),
                color: "green",
            });
        } catch (error) {
            console.error('Failed to remove employee', error);
            notifications.show({
                title: t("errors.error"),
                message: t("errors.deleteEmployeeFailed"),
                color: "red",
            });

        } finally {
            setConfirmEmployeeOpen(false);
            setEmployeeToRemove(null);
        }
    };

    const confirmInviteRemove = async () => {
        if (!invitationToRemove || !organizationId) return;

        try {
            await cancelInviteEmployeeToOrganization(organizationId, invitationToRemove.invitationId)

            setInvitations((prev) =>
                prev.filter((i) => i.invitationId !== invitationToRemove.invitationId)
            );

            notifications.show({
                title: t("success.title"),
                message: t("success.deleteInvitation"),
                color: "green",
            });
        } catch (error) {
            console.error('Failed to remove employee', error);
            notifications.show({
                title: t("errors.error"),
                message: t("errors.deleteInvitationFailed"),
                color: "red",
            });

        } finally {
            setConfirmInviteOpen(false);
            setInvitationToRemove(null);
        }
    };

    useEffect(() => {
        if (!user?.sub) return;

        const loadOrganization = async () => {
            const organization = await getEmployeeOrganization(user.sub);
            setOwner(organization.ownerId);
            setOrganizationId(organization.businessId);

            setInvitations(await getAllOrganizationInvitations(organization.businessId))

            const ep = await getAllOrganizationEmployees(organization.businessId)
            const employeeData: Employee[] = await Promise.all(
                ep.map(async (employee) => {
                    const res = await fetch(`/api/auth0/get-user/${encodeURI(employee.user_id)}`);
                    const user = await res.json() as Promise<Employee>;
                    return {
                        ...user,
                        employee_id: employee.employeeId,
                    }
                })
            );
            setEmployees(employeeData);
        };

        loadOrganization();
    }, [user?.sub]);

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between">
                <Title order={2}>{t("title")}</Title>
                {user?.sub === owner &&
                    <Button
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                    >
                        {t("addButton")}
                    </Button>
                }
            </Group>

            <AddEmployeeModal
                opened={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                employees={employees}
                invitations={invitations}
                organizationId={organizationId!}
            />

            {user?.sub && owner && (
                <Accordion variant="separated" defaultValue={["active", "invites"]} multiple>
                    <InvitationTable
                        invitations={invitations}
                        onDelete={handleDeleteInvitation}
                    />

                    <EmployeeTable
                        employees={employees}
                        onDelete={handleDeleteEmployee}
                        currentUserId={user.sub}
                        ownerId={owner}
                    />
                </Accordion>
            )}

            <ConfirmationModal
                opened={confirmEmployeeOpen}
                title={t("modal.employeeTitle")}
                message={t.rich("modal.employeeMessage", {
                    name: employeeToRemove?.name || "",
                    bold: (chunks) => <strong>{chunks}</strong>
                })}                                // message={`Are you sure you want to remove ${employeeToRemove?.name || ""} from your organization?`}
                cancelLabel={t("modal.cancel")}
                confirmLabel={t("modal.confirm")}
                confirmColor="red"
                onCancel={() => setConfirmEmployeeOpen(false)}
                onConfirm={confirmEmployeeRemove}
            />

            <ConfirmationModal
                opened={confirmInviteOpen}
                title={t("modal.invitationTitle")}
                message={t.rich("modal.invitationMessage", {
                    email: invitationToRemove?.email || "",
                    bold: (chunks) => <strong>{chunks}</strong>
                })}
                cancelLabel={t("modal.cancel")}
                confirmLabel={t("modal.confirm")}
                confirmColor="red"
                onCancel={() => setConfirmInviteOpen(false)}
                onConfirm={confirmInviteRemove}
            />
        </Stack>
    );
}
