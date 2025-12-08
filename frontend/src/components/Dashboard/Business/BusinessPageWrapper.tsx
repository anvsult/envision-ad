"use client";

import React from "react";
import { Header } from "@/components/Header/Header";
import {
    Button,
    Group,
    Stack,
    NavLink,
    Paper,
    Drawer,
    Box,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
    IconLayoutDashboard,
    IconDeviceTv,
    IconAd,
    IconFileDescription,
    IconCurrencyDollar,
    IconBuildingStore
} from "@tabler/icons-react";
import { Link, usePathname } from "@/i18n/navigation";
import { BusinessDashboard } from "./BusinessDashboard";

export function BusinessPageWrapper() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const pathname = usePathname();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const sidebarContent = (
        <Stack gap="xs">
            <NavLink
                component={Link}
                href="/dashboard/overview"
                label="Overview"
                leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}
                active={pathname?.includes("/overview")}
                onClick={isMobile ? close : undefined}
            />
            <NavLink
                component={Link}
                href="/dashboard"
                label="Media"
                leftSection={<IconDeviceTv size={20} stroke={1.5} />}
                active={pathname === "/dashboard" || pathname?.endsWith("/dashboard")}
                onClick={isMobile ? close : undefined}
            />
            <NavLink
                component={Link}
                href="/business"
                label="Business"
                leftSection={<IconBuildingStore size={20} stroke={1.5} />}
                active={pathname?.includes("/business")}
                onClick={isMobile ? close : undefined}
            />
            <NavLink
                component={Link}
                href="/dashboard/displayed-ads"
                label="Displayed ads"
                leftSection={<IconAd size={20} stroke={1.5} />}
                active={pathname?.includes("/displayed-ads")}
                onClick={isMobile ? close : undefined}
            />
            <NavLink
                component={Link}
                href="/dashboard/ad-requests"
                label="Ad requests"
                leftSection={<IconFileDescription size={20} stroke={1.5} />}
                active={pathname?.includes("/ad-requests")}
                onClick={isMobile ? close : undefined}
            />
            <NavLink
                component={Link}
                href="/dashboard/transactions"
                label="Transactions"
                leftSection={<IconCurrencyDollar size={20} stroke={1.5} />}
                active={pathname?.includes("/transactions")}
                onClick={isMobile ? close : undefined}
            />
        </Stack>
    );

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
                    {sidebarContent}
                </Drawer>

                <Group align="flex-start" gap={0} wrap="nowrap">
                    {!isMobile && (
                        <Paper
                            w={250}
                            p="md"
                            style={{ minHeight: "calc(100vh - 80px)", borderRadius: 0 }}
                            withBorder
                        >
                            {sidebarContent}
                        </Paper>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <BusinessDashboard />
                    </div>
                </Group>
            </Box>
        </>
    );
}
