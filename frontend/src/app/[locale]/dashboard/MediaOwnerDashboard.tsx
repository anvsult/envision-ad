"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/Header/Header";
import { MediaModal } from "@/components/Dashboard/MediaOwner/MediaModal/MediaModal";
import { MediaTable } from "@/components/Dashboard/MediaOwner/MediaTable/MediaTable";
import { useMediaList } from "@/components/Dashboard/MediaOwner/hooks/useMediaList";
import { useMediaForm } from "@/components/Dashboard/MediaOwner/hooks/useMediaForm";
import {
  Button,
  Badge,
  Pagination,
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
} from "@tabler/icons-react";
import { Link, usePathname } from "@/lib/i18n/navigation";

const ITEMS_PER_PAGE = 20;

export default function MediaOwnerPage() {
  const { media, addNewMedia, editMedia, deleteMediaById, fetchMediaById } = useMediaList();
  const { formState, updateField, updateDayTime, resetForm, setFormState } = useMediaForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSave = async () => {
    try {
      if (editingId) {
        await editMedia(editingId, formState);
      } else {
        await addNewMedia(formState);
      }
      setIsModalOpen(false);
      resetForm();
      setEditingId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    }
  };

  const handleEdit = async (id: string | number) => {
    try {
      const backend = await fetchMediaById(id);
      // Map backend DTO to MediaFormState shape
      const schedule = backend.schedule || { selectedMonths: [], days: {} };

      const activeDaysOfWeek: Record<string, boolean> = {
        Monday: !!(schedule.days?.monday?.isActive),
        Tuesday: !!(schedule.days?.tuesday?.isActive),
        Wednesday: !!(schedule.days?.wednesday?.isActive),
        Thursday: !!(schedule.days?.thursday?.isActive),
        Friday: !!(schedule.days?.friday?.isActive),
        Saturday: !!(schedule.days?.saturday?.isActive),
        Sunday: !!(schedule.days?.sunday?.isActive),
      };

      const dailyOperatingHours: Record<string, { start: string; end: string }> = {
        Monday: { start: schedule.days?.monday?.startTime ?? "00:00", end: schedule.days?.monday?.endTime ?? "00:00" },
        Tuesday: { start: schedule.days?.tuesday?.startTime ?? "00:00", end: schedule.days?.tuesday?.endTime ?? "00:00" },
        Wednesday: { start: schedule.days?.wednesday?.startTime ?? "00:00", end: schedule.days?.wednesday?.endTime ?? "00:00" },
        Thursday: { start: schedule.days?.thursday?.startTime ?? "00:00", end: schedule.days?.thursday?.endTime ?? "00:00" },
        Friday: { start: schedule.days?.friday?.startTime ?? "00:00", end: schedule.days?.friday?.endTime ?? "00:00" },
        Saturday: { start: schedule.days?.saturday?.startTime ?? "00:00", end: schedule.days?.saturday?.endTime ?? "00:00" },
        Sunday: { start: schedule.days?.sunday?.startTime ?? "00:00", end: schedule.days?.sunday?.endTime ?? "00:00" },
      };

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const activeMonths: Record<string, boolean> = {};
      months.forEach((m) => (activeMonths[m] = (schedule.selectedMonths || []).includes(m)));

      // populate the form
      setFormState({
        mediaTitle: backend.title ?? "",
        mediaOwnerName: backend.mediaOwnerName ?? "",
        resolution: backend.resolution ?? "",
        displayType: backend.typeOfDisplay ?? null,
        loopDuration: backend.loopDuration != null ? String(backend.loopDuration) : "",
        aspectRatio: backend.aspectRatio ?? "",
        widthCm: backend.width != null ? String(backend.width) : "",
        heightCm: backend.height != null ? String(backend.height) : "",
        weeklyPrice: backend.price != null ? String(backend.price) : "",
        dailyImpressions: backend.dailyImpressions != null ? String(backend.dailyImpressions) : "",
        mediaAddress: backend.address ?? "",
        activeDaysOfWeek,
        dailyOperatingHours,
        activeMonths,
      });

      setEditingId(String(id));
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch media for edit:", err);
      alert("Failed to load media for editing");
    }
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = confirm("Are you sure you want to delete this media?");
    if (!confirmed) return;
    try {
      await deleteMediaById(id);
    } catch (err) {
      console.error("Failed to delete media:", err);
      alert("Failed to delete media");
    }
  };

  const totalPages = Math.ceil(media.length / ITEMS_PER_PAGE);
  const paginatedMedia = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return media.slice(start, end);
  }, [media, activePage]);

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
        rightSection={
          <Badge size="sm" color="blue" variant="filled">
            {media.length}
          </Badge>
        }
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

          <Stack gap="md" p="md" style={{ flex: 1, minWidth: 0 }}>
            <Group justify="flex-start">
              <Button onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }}>
                Add new media
              </Button>
            </Group>
            <MediaModal
              opened={isModalOpen}
              onClose={() => { setIsModalOpen(false); setEditingId(null); resetForm(); }}
              onSave={handleSave}
              formState={formState}
              onFieldChange={updateField}
              onDayTimeChange={updateDayTime}
            />

            <MediaTable rows={paginatedMedia} onEdit={handleEdit} onDelete={handleDelete} />
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