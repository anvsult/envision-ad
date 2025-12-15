"use client";

import React, { useMemo, useState } from "react";
import { Header } from "@/components/Header/Header";
import SideBar from "@/components/SideBar/SideBar";
import {
  Box,
  Drawer,
  Group,
  Pagination,
  Paper,
  Stack,
  Title,
  Loader,
  Center,
  Text,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { ApproveMediaTable } from "@/components/Dashboard/Admin/ApproveMediaTable/ApproveMediaTable";
import type { ApproveMediaRowData } from "@/components/Dashboard/Admin/ApproveMediaTable/ApproveMediaRow";
import { useAdminPendingMedia } from "@/components/Dashboard/Admin/hooks/useAdminPendingMedia";

const ITEMS_PER_PAGE = 20;

export default function ApprovingMediaDashboard() {
  const t = useTranslations("admin.adminActions");

  const [activePage, setActivePage] = useState(1);

  const [opened, { toggle, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { media, loading, error } = useAdminPendingMedia();

  const pendingRows: ApproveMediaRowData[] = useMemo(() => {
    return (media ?? [])
        .filter((m) => (m.status ?? "PENDING") === "PENDING")
        .map((m) => {
          const city = m.mediaLocation?.city ?? "";
          const province = m.mediaLocation?.province ?? "";
          const location = [city, province].filter(Boolean).join(", ") || "—";

          return {
            id: String(m.id),
            name: m.title ?? "—",
            image: m.imageUrl ?? null,
            mediaOwnerName: m.mediaOwnerName ?? "—",
            location,
            dailyImpressions: Number(m.dailyImpressions ?? 0),
            price:
                m.price != null ? `$${Number(m.price).toFixed(2)}` : "$0.00",
            status: m.status ?? "PENDING",
          };
        });
  }, [media]);

  const totalPages = Math.max(1, Math.ceil(pendingRows.length / ITEMS_PER_PAGE));

  const paginatedRows = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return pendingRows.slice(start, end);
  }, [pendingRows, activePage]);

  React.useEffect(() => {
    if (activePage > totalPages) setActivePage(1);
  }, [activePage, totalPages]);

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

              {loading ? (
                  <Center py="xl">
                    <Loader />
                  </Center>
              ) : error ? (
                  <Text c="red" fw={500}>
                    {error}
                  </Text>
              ) : (
                  <>
                    <ApproveMediaTable rows={paginatedRows} />

                    {pendingRows.length > ITEMS_PER_PAGE && (
                        <Group justify="center" mt="md">
                          <Pagination
                              total={totalPages}
                              value={activePage}
                              onChange={setActivePage}
                              size="md"
                          />
                        </Group>
                    )}
                  </>
              )}
            </Stack>
          </Group>
        </Box>
      </>
  );
}
