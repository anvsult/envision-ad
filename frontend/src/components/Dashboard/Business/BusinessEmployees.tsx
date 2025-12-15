"use client";

import React, {useEffect, useState} from "react";
import {Header} from "@/components/Header/Header";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {Accordion, Box, Button, Drawer, Group, Paper, Stack, Title} from "@mantine/core";
import {useTranslations} from "next-intl";
import {AddEmployeeModal} from "@/components/Dashboard/Business/BusinessModal/AddEmployeeModal";
import {useUser} from "@auth0/nextjs-auth0";
import {
    cancelInviteEmployeeToBusiness,
    getAllBusinessEmployees,
    getAllBusinessInvitations,
    getEmployeeBusiness,
    removeEmployeeFromBusiness
} from "@/services/BusinessService";
import {EmployeeTable} from "@/components/Dashboard/Business/BusinessTable/EmployeesTable";
import SideBar from "@/components/SideBar/SideBar";
import type {UserType} from "@/types/UserType";
import {InvitationResponse} from "@/types/InvitationType";
import {InvitationTable} from "@/components/Dashboard/Business/BusinessTable/InvitationsTable";
import {ConfirmRemoveInviteModal} from "@/components/Dashboard/Business/BusinessModal/ConfirmRemoveInviteModal";
import {ConfirmRemoveEmployeeModal} from "@/components/Dashboard/Business/BusinessModal/ConfirmRemoveEmployeeModal";

export function BusinessEmployees() {
    const [opened, {toggle, close}] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [owner, setOwner] = useState<string | null>(null);
    const [employees, setEmployees] = useState<UserType[]>([]);
    const [invitations, setInvitations] = useState<InvitationResponse[]>([])
    const [businessId, setBusinessId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeEmail, setEmployeeEmail] = useState("");

    const [confirmEmployeeOpen, setConfirmEmployeeOpen] = useState(false);
    const [confirmInviteOpen, setConfirmInviteOpen] = useState(false);
    const [employeeToRemove, setEmployeeToRemove] = useState<UserType | null>(null);
    const [invitationToRemove, setInvitationToRemove] = useState<InvitationResponse | null>(null);

    const t = useTranslations("business.employees");
    const {user} = useUser();

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSuccess = async () => {
        setIsModalOpen(false);

        if (businessId)
            setInvitations(await getAllBusinessInvitations(businessId));
    };

    const handleDeleteEmployee = (employee: UserType) => {
        setEmployeeToRemove(employee);
        setConfirmEmployeeOpen(true);
    };

    const handleDeleteInvitation = (invitation: InvitationResponse) => {
        setInvitationToRemove(invitation);
        setConfirmInviteOpen(true);
    };

    const confirmEmployeeRemove = async () => {
        if (!employeeToRemove || !businessId) return;

        await removeEmployeeFromBusiness(businessId, employeeToRemove.employee_id)

        setEmployees((prev) =>
            prev.filter((e) => e.employee_id !== employeeToRemove.employee_id)
        );

        setConfirmEmployeeOpen(false);
        setEmployeeToRemove(null);
    };

    const confirmInviteRemove = async () => {
        if (!invitationToRemove || !businessId) return;

        await cancelInviteEmployeeToBusiness(businessId, invitationToRemove.invitationId)

        setInvitations((prev) =>
            prev.filter((i) => i.invitationId !== invitationToRemove.invitationId)
        );

        setConfirmInviteOpen(false);
        setInvitationToRemove(null);
    };

    useEffect(() => {
        if (!user?.sub) return;

        const loadBusiness = async () => {
            const business = await getEmployeeBusiness(user.sub);
            setOwner(business.ownerId);
            setBusinessId(business.businessId);

            setInvitations(await getAllBusinessInvitations(business.businessId))

            const ep = await getAllBusinessEmployees(business.businessId)
            const employeeData: UserType[] = await Promise.all(
                ep.map(async (employee) => {
                    const res = await fetch(`/api/auth0/get-user/${encodeURI(employee.userId)}`);
                    const user = await res.json() as Promise<UserType>;
                    return {
                        ...user,
                        employee_id: employee.employeeId,
                    }
                })
            );
            setEmployees(employeeData);
        };

        loadBusiness();
    }, [user?.sub]);

    return (
        <>
            <Header
                dashboardMode={true}
                sidebarOpened={opened}
                onToggleSidebar={toggle}
            />
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
                                businessId={businessId!}
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

                            <ConfirmRemoveEmployeeModal
                                opened={confirmEmployeeOpen}
                                employeeName={employees.find((e) => e.employee_id === employeeToRemove?.employee_id)?.name || ""}
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
