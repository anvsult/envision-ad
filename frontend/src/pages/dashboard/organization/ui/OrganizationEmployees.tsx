"use client";

import React, {useEffect, useState} from "react";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {Accordion, Box, Button, Drawer, Group, Paper, Stack, Title} from "@mantine/core";
import {useTranslations} from "next-intl";
import {AddEmployeeModal} from "@/pages/dashboard/organization/ui/modals/AddEmployeeModal";
import {useUser} from "@auth0/nextjs-auth0";
import {
    cancelInviteEmployeeToOrganization,
    getAllOrganizationEmployees,
    getAllOrganizationInvitations,
    getEmployeeOrganization,
    removeEmployeeFromOrganization
} from "@/features/organization-management/api";
import {EmployeeTable} from "@/pages/dashboard/organization/ui/tables/EmployeesTable";
import SideBar from "@/widgets/SideBar/SideBar";
import {ConfirmationModal} from "@/shared/ui/ConfirmationModal";
import type {Employee} from "@/entities/organization";
import {InvitationResponse} from "@/entities/organization";
import {InvitationTable} from "@/pages/dashboard/organization/ui/tables/InvitationsTable";
import {ConfirmRemoveInviteModal} from "@/pages/dashboard/organization/ui/modals/ConfirmRemoveInviteModal";

export default function OrganizationEmployees() {
    const [opened, {toggle, close}] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [owner, setOwner] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [invitations, setInvitations] = useState<InvitationResponse[]>([])
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeEmail, setEmployeeEmail] = useState("");

    const [confirmEmployeeOpen, setConfirmEmployeeOpen] = useState(false);
    const [confirmInviteOpen, setConfirmInviteOpen] = useState(false);
    const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);
    const [invitationToRemove, setInvitationToRemove] = useState<InvitationResponse | null>(null);

    const t = useTranslations("organization.employees");
    const {user} = useUser();

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

        await removeEmployeeFromOrganization(organizationId, employeeToRemove.employee_id)

        setEmployees((prev) =>
            prev.filter((e) => e.employee_id !== employeeToRemove.employee_id)
        );

        setConfirmEmployeeOpen(false);
        setEmployeeToRemove(null);
    };

    const confirmInviteRemove = async () => {
        if (!invitationToRemove || !organizationId) return;

        await cancelInviteEmployeeToOrganization(organizationId, invitationToRemove.invitationId)

        setInvitations((prev) =>
            prev.filter((i) => i.invitationId !== invitationToRemove.invitationId)
        );

        setConfirmInviteOpen(false);
        setInvitationToRemove(null);
    };

    useEffect(() => {
        if (!user?.sub) return;

        const loadOrganization = async () => {
            const organization = await getEmployeeOrganization(user.sub);
            setOwner(organization.ownerId);
            setOrganizationId(organization.organizationId);

            setInvitations(await getAllOrganizationInvitations(organization.organizationId))

            const ep = await getAllOrganizationEmployees(organization.organizationId)
            const employeeData: Employee[] = await Promise.all(
                ep.map(async (employee) => {
                    const res = await fetch(`/api/auth0/get-user/${encodeURI(employee.employee_id)}`);
                    const user = await res.json() as Promise<Employee>;
                    return {
                        ...user,
                        employee_id: employee.employee_id,
                    }
                })
            );
            setEmployees(employeeData);
        };

        loadOrganization();
    }, [user?.sub]);

    return (
        <>
            <Box>
                <Drawer
                    opened={opened}
                    onClose={close}
                    size="xs"
                    padding="md"
                    hiddenFrom="md"
                    zIndex={1000}
                >
                    <SideBar></SideBar>
                </Drawer>

                <Group align="flex-start" gap={0} wrap="nowrap">
                    {!isMobile && (
                        <Paper
                            w={250}
                            p="md"
                            style={{minHeight: "calc(100vh - 80px)", borderRadius: 0}}
                            withBorder
                        >
                            <SideBar></SideBar>
                        </Paper>
                    )}

                    <div style={{flex: 1, minWidth: 0}}>
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
                                email={employeeEmail}
                                setEmail={setEmployeeEmail}
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
                                title="Confirm Removal"
                                message={`Are you sure you want to remove ${employeeToRemove?.name || ""} from your organization?`}
                                confirmLabel="Remove"
                                confirmColor="red"
                                onCancel={() => setConfirmEmployeeOpen(false)}
                                onConfirm={confirmEmployeeRemove}
                            />
                            <ConfirmRemoveInviteModal
                                opened={confirmInviteOpen}
                                email={invitationToRemove?.email || ""}
                                onCancel={() => setConfirmInviteOpen(false)}
                                onConfirm={confirmInviteRemove}
                            />
                        </Stack>
                    </div>
                </Group>
            </Box>
        </>
    );
}
