'use client'

import {Box, Drawer, Group, Paper, } from "@mantine/core";
import SideBar from "@/widgets/SideBar/SideBar";
import React from "react";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {withPageAuthRequired} from "@auth0/nextjs-auth0";

export default withPageAuthRequired(function DashboardPage() {
    const [opened, {toggle, close}] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

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
                </Group>
            </Box>
        </>
    );
});