"use client";

import React, {useEffect, useState} from "react";
import {Header} from "@/components/Header/Header";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {Stack, Paper, Drawer, Box, Group, Title} from "@mantine/core";
import {BusinessDetail} from "@/components/Dashboard/Business/BusinessTable/BusinessTable";
import {BusinessModal} from "@/components/Dashboard/Business/BusinessModal/BusinessModal";
import {useTranslations} from "next-intl";
import {useBusinessForm} from "@/components/Dashboard/Business/hooks/useBusinessForm";
import {BusinessResponse, CompanySize} from "@/types/BusinessTypes";
import {useUser} from "@auth0/nextjs-auth0";
import {getEmployeeBusiness} from "@/services/BusinessService";
import SideBar from "@/components/SideBar/SideBar";

export function BusinessDashboard() {
    const [opened, {toggle, close}] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const {formState, updateField, resetForm, setFormState} = useBusinessForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [business, setBusiness] = useState<BusinessResponse | null>(null);
    const { user, isLoading } = useUser();

    const loadBusiness = async () => {
        const business = await getEmployeeBusiness(user!.sub);
        setBusiness(business);
    };

    useEffect(() => {
        if (!user?.sub) return;

        const loadBusiness = async () => {
            const business = await getEmployeeBusiness(user.sub);
            setBusiness(business);
        };

        loadBusiness();
    }, [user?.sub]);

    const t = useTranslations("business");

    const handleEdit = async (id: string | number) => {
        try {
            // Map BusinessResponse to BusinessRequest format
            setFormState({
                name: business!.name ?? "",
                owner: business!.owner,
                companySize:
                    (typeof business!.companySize === "string"
                        ? CompanySize[business!.companySize as keyof typeof CompanySize]
                        : business!.companySize) ?? CompanySize.SMALL,
                address: {
                    street: business!.address?.street ?? "",
                    city: business!.address?.city ?? "",
                    state: business!.address?.state ?? "",
                    zipCode: business!.address?.zipCode ?? "",
                    country: business!.address?.country ?? ""
                },
                roles: {
                    advertiser: business!.roles.advertiser ?? false,
                    mediaOwner: business!.roles.mediaOwner ?? false
                }
            });
            setIsModalOpen(true);
        } catch (err) {
            console.error("Failed to fetch business for edit:", err);
            alert("Failed to load business for editing");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

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
                            </Group>

                            {business && (
                                <>
                                    <BusinessDetail
                                        business={business}
                                        onEdit={handleEdit}
                                    />

                                    <BusinessModal
                                        opened={isModalOpen}
                                        onClose={handleCloseModal}
                                        onSuccess={loadBusiness}
                                        formState={formState}
                                        onFieldChange={updateField}
                                        resetForm={resetForm}
                                        editingId={business?.businessId ?? null}
                                    />
                                </>
                            )}
                        </Stack>
                    </div>
                </Group>
            </Box>
        </>
    );
}
