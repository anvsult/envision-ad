"use client";

import React, { useMemo, useState } from "react";
import { Header } from "@/components/Header/Header";
import SideBar from "@/components/SideBar/SideBar";
import { useMediaList } from "@/components/Dashboard/MediaOwner/hooks/useMediaList";
import {
  Box,
  Drawer,
  Group,
  Pagination,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ApproveMediaTable } from "@/components/Dashboard/Admin/ApproveMediaTable/ApproveMediaTable";
import { useTranslations } from "next-intl";
const ITEMS_PER_PAGE = 20;

export default function ApprovingMediaDashboard() {
  const t = useTranslations("admin.adminActions");
  const { media } = useMediaList();
  const [activePage, setActivePage] = useState(1);

  const [opened, { toggle, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const pendingMedia = useMemo(
    () => media.filter((m) => m.status === "PENDING"),
    [media]
  );

  const totalPages = Math.ceil(pendingMedia.length / ITEMS_PER_PAGE);

  const paginatedRows = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return pendingMedia.slice(start, end);
  }, [pendingMedia, activePage]);

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
          <SideBar />
        </Drawer>

        <Group align="flex-start" gap={0} wrap="nowrap">
          {!isMobile && (
            <Paper
              w={250}
              p="md"
              style={{ minHeight: "calc(100vh - 80px)", borderRadius: 0 }}
              withBorder
            >
              <SideBar />
            </Paper>
          )}

          <Stack gap="md" p="md" style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" align="center">
              <Title order={3}>{t("pendingMedia")}</Title>
            </Group>

            <ApproveMediaTable rows={paginatedRows} />

            {totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  total={totalPages}
                  value={activePage}
                  onChange={setActivePage}
                  size="md"
                />
              </Group>
            )}
          </Stack>
        </Group>
      </Box>
    </>
  );
}
