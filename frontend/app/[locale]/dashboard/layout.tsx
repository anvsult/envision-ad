"use client";

import React from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Box, Center, Drawer, Group, Loader, Paper } from "@mantine/core";
import SideBar from "@/widgets/SideBar/SideBar";
import { useOrganization } from "@/app/providers";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const [opened, { close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { organization, loading } = useOrganization();

    if (loading) {
        return (
            <Center style={{ flex: 1 }}>
                <Loader size="xl" />
            </Center>
        );
    }

    return (
        <Box>
            <Drawer
                opened={opened}
                onClose={close}
                size="xs"
                padding="md"
                hiddenFrom="md"
                zIndex={1000}
            >
                <SideBar />
            </Drawer>

            <Group align="stretch" gap={0} wrap="nowrap">
                {!isMobile && organization && (
                    <Paper
                        w={250}
                        p="md"
                        style={{ minHeight: "calc(100vh - 80px)", borderRadius: 0 }}
                        withBorder
                        bg="gray.0"
                    >
                        <SideBar />
                    </Paper>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                    {children}
                </div>
            </Group>
        </Box>
    );
}