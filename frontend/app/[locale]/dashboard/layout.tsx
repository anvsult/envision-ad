"use client";

import React from "react";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {Box, Drawer, Group, Paper} from "@mantine/core";
import SideBar from "@/widgets/SideBar/SideBar";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const [opened, {close}] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

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

            <Group align="flex-start" gap={0} wrap="nowrap">
                {!isMobile && (
                    <Paper
                        w={250}
                        p="md"
                        style={{minHeight: "calc(100vh - 80px)", borderRadius: 0}}
                        withBorder
                    >
                        <SideBar />
                    </Paper>
                )}

                <div style={{flex: 1, minWidth: 0}}>
                    {children}
                </div>
            </Group>
        </Box>
    );
}