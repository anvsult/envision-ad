"use client";

import React, {useEffect, useState} from "react";
import {Accordion, Button, Group, Stack, Title, Loader, Center} from "@mantine/core";
import {useTranslations} from "next-intl";
import {AddEmployeeModal} from "@/pages/dashboard/organization/ui/modals/AddEmployeeModal";
import {useUser} from "@auth0/nextjs-auth0/client";
import {
    cancelInviteEmployeeToOrganization,
    getAllOrganizationEmployees,
    getAllOrganizationInvitations,
    getEmployeeOrganization,
    removeEmployeeFromOrganization
} from "@/features/organization-management/api";
import {EmployeeTable} from "@/pages/dashboard/organization/ui/tables/EmployeesTable";
import {ConfirmationModal} from "@/shared/ui/ConfirmationModal";
import type {Employee, OrganizationResponseDTO} from "@/entities/organization";
import {InvitationResponse} from "@/entities/organization";
import {InvitationTable} from "@/pages/dashboard/organization/ui/tables/InvitationsTable";
import {notifications} from "@mantine/notifications";
import {AUTH0_ROLES} from "@/shared/lib/auth/roles";

export default function OrganizationEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
    const [organization, setOrganization] = useState<OrganizationResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [confirmEmployeeOpen, setConfirmEmployeeOpen] = useState(false);
    const [confirmInviteOpen, setConfirmInviteOpen] = useState(false);
    const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);
    const [invitationToRemove, setInvitationToRemove] = useState<InvitationResponse | null>(null);

    const t = useTranslations("organization.employees");
    const { user } = useUser();

    useEffect(() => {
        if (!user?.sub) return;

        const loadOrganization = async () => {
            try {
                setLoading(true);
                const organization = await getEmployeeOrganization(user.sub);
                setOrganization(organization);

                if (organization?.businessId) {
                    const [invitationsData, employeesData] = await Promise.all([
                        getAllOrganizationInvitations(organization.businessId),
                        getAllOrganizationEmployees(organization.businessId)
                    ]);

                    setInvitations(invitationsData);

                    const employeeData: Employee[] = await Promise.all(
                        employeesData.map(async (employee) => {
                            const res = await fetch(`/api/auth0/get-user/${encodeURIComponent(employee.user_id)}`);
                            const auth0Data = await res.json();
                            return {
                                ...employee,
                                ...auth0Data
                            };
                        })
                    );
                    setEmployees(employeeData);
                }
            } catch (error) {
                console.error("Failed to load organization", error);
                notifications.show({
                    title: t("errors.error"),
                    message: t("errors.loadFailed"),
                    color: "red",
                });
            } finally {
                setLoading(false);
            }
        };

        void loadOrganization();
    }, [user?.sub]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSuccess = async () => {
        setIsModalOpen(false);

        if (organization?.businessId) {
            const invitationsData = await getAllOrganizationInvitations(organization.businessId);
            setInvitations(invitationsData);
        }
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
        if (!employeeToRemove || !organization?.businessId) return;

        try {
            await removeEmployeeFromOrganization(organization.businessId, employeeToRemove.employee_id);

            await fetch(`/api/auth0/update-user-roles/${encodeURIComponent(employeeToRemove.user_id)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roles: [
                        ...(organization.roles.advertiser ? [AUTH0_ROLES.ADVERTISER] : []),
                        ...(organization.roles.mediaOwner ? [AUTH0_ROLES.MEDIA_OWNER] : [])
                    ]
                })
            });

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
        if (!invitationToRemove || !organization?.businessId) return;

        try {
            await cancelInviteEmployeeToOrganization(organization.businessId, invitationToRemove.invitationId)

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

    if (loading) {
        return (
            <Center h={400}>
                <Loader size="lg" />
            </Center>
        );
    }

    if (!organization) {
        return (
            <Stack gap="md" p="md">
                <Title order={2}>{t("noOrganization")}</Title>
            </Stack>
        );
    }

    return (
        <Stack gap="md" p="md">
            <Group justify="space-between">
                <Title order={2}>{t("title")}</Title>
                {user?.sub === organization.ownerId &&
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
                organizationId={organization.businessId}
            />

            {user?.sub && organization.ownerId && (
                <Accordion variant="separated" defaultValue={["active", "invites"]} multiple>
                    <InvitationTable
                        invitations={invitations}
                        onDelete={handleDeleteInvitation}
                    />

                    <EmployeeTable
                        employees={employees}
                        onDelete={handleDeleteEmployee}
                        currentUserId={user.sub}
                        ownerId={organization.ownerId}
                    />
                </Accordion>
            )}

            <ConfirmationModal
                opened={confirmEmployeeOpen}
                title={t("modal.employeeTitle")}
                message={t.rich("modal.employeeMessage", {
                    name: employeeToRemove?.name || "",
                    bold: (chunks) => <strong>{chunks}</strong>
                })}
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