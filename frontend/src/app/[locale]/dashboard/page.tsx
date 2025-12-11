'use client'

import {Header} from "@/components/Header/Header";
import {Box, Drawer, Group, Paper, } from "@mantine/core";
import SideBar from "@/components/SideBar/SideBar";
import React from "react";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default withPageAuthRequired(function Page() {
    const [opened, {toggle, close}] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

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
                </Group>
            </Box>
        </>
    );
});