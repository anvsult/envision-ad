"use client";

import React, {useEffect, useState} from "react";
import {Header} from "@/components/Header/Header";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {Box, Button, Drawer, Group, Paper, Stack, Title} from "@mantine/core";
import {useTranslations} from "next-intl";
import {AddEmployeeModal} from "@/components/Dashboard/Business/BusinessModal/AddEmployeeModal";
import {useUser} from "@auth0/nextjs-auth0";
import {getEmployeeBusiness, removeEmployeeFromBusiness} from "@/services/BusinessService";
import {EmployeeTable} from "@/components/Dashboard/Business/BusinessTable/EmployeesTable";
import SideBar from "@/components/SideBar/SideBar";
import {ConfirmRemoveEmployeeModal} from "@/components/Dashboard/Business/BusinessModal/ConfirmationModal";
import type {UserType} from "@/types/UserType";

export function BusinessEmployees() {
    const [opened, {toggle, close}] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [owner, setOwner] = useState<string | null>(null);
    const [employees, setEmployees] = useState<UserType[]>([]);
    const [businessId, setBusinessId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeEmail, setEmployeeEmail] = useState("");

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [employeeToRemove, setEmployeeToRemove] = useState<string | null>(null);

    const t = useTranslations("business.employees");
    const {user} = useUser();

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
    };

    const handleDeleteEmployee = (employee: string) => {
        setEmployeeToRemove(employee);
        setConfirmOpen(true);
    };

    const confirmRemove = async () => {
        if (!employeeToRemove || !businessId) return;

        await removeEmployeeFromBusiness(businessId, employeeToRemove)

        setEmployees((prev) =>
            prev.filter((e) => e.user_id !== employeeToRemove)
        );

        setConfirmOpen(false);
        setEmployeeToRemove(null);
    };

    useEffect(() => {
        if (!user?.sub) return;

        const loadBusiness = async () => {
            const business = await getEmployeeBusiness(user.sub);
            setOwner(business.owner);
            setBusinessId(business.businessId);
            const employeeData: UserType[] = await Promise.all(
                business.employees.map(async (employeeId) => {
                    const res = await fetch(`/api/auth0/get-user/${employeeId}`);
                    return res.json() as Promise<UserType>;
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
                                <EmployeeTable
                                    employees={employees}
                                    onDelete={handleDeleteEmployee}
                                    currentUserId={user.sub}
                                    ownerId={owner}
                                />
                            )}

                            <ConfirmRemoveEmployeeModal
                                opened={confirmOpen}
                                employeeName={employees.find((e) => e.user_id === employeeToRemove)?.name || ""}
                                onCancel={() => setConfirmOpen(false)}
                                onConfirm={confirmRemove}
                            />
                        </Stack>
                    </div>
                </Group>
            </Box>
        </>
    );
}
