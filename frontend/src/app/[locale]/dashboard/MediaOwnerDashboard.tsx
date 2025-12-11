"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/Header/Header";
import { MediaModal } from "@/components/Dashboard/MediaOwner/MediaModal/MediaModal";
import { MediaTable } from "@/components/Dashboard/MediaOwner/MediaTable/MediaTable";
import { useMediaList } from "@/components/Dashboard/MediaOwner/hooks/useMediaList";
import { useMediaForm } from "@/components/Dashboard/MediaOwner/hooks/useMediaForm";
import { useTranslations } from "next-intl";
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
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useUser } from "@auth0/nextjs-auth0/client";
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
  const { media, addNewMedia, editMedia, deleteMediaById, fetchMediaById } =
    useMediaList();
  const { formState, updateField, updateDayTime, resetForm, setFormState } =
    useMediaForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const { user } = useUser();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const t = useTranslations("mediaModal");
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = (form: typeof formState) => {
    if (!form.mediaTitle.trim()) return t("errors.titleRequired");
    if (!form.mediaTitle.trim()) return t("errors.titleRequired");
    if (!form.mediaAddress.trim()) return t("errors.addressRequired");
    if (!form.mediaAddress.trim()) return t("errors.addressRequired");
    if (!form.weeklyPrice.trim()) return t("errors.priceRequired");
    if (!form.dailyImpressions.trim()) return t("errors.impressionsRequired");
    if (!form.displayType) return t("errors.displayTypeRequired");

    if (form.displayType === "DIGITAL") {
      if (!form.loopDuration.trim()) return t("errors.loopDurationRequired");
      if (!form.resolution.trim()) return t("errors.resolutionRequired");
    } else if (form.displayType === "POSTER") {
      if (!form.widthCm.trim()) return t("errors.widthRequired");
      if (!form.heightCm.trim()) return t("errors.heightRequired");
    }

    // Schedule validation
    const hasActiveDay = Object.values(form.activeDaysOfWeek).some((isActive) => isActive);
    if (!hasActiveDay) return t("errors.atLeastOneDayRequired");

    const hasActiveMonth = Object.values(form.activeMonths).some((isActive) => isActive);
    if (!hasActiveMonth) return t("errors.atLeastOneMonthRequired");

    for (const [day, isActive] of Object.entries(form.activeDaysOfWeek)) {
      if (isActive) {
        const { start, end } = form.dailyOperatingHours[day];
        if (!start || !end) return t("errors.timeRequiredForDay", { day });
        if (start >= end) return t("errors.invalidTimeRangeForDay", { day });
      }
    }

    return null;
  };

  const handleSave = async () => {
    setValidationError(null);
    const error = validateForm(formState);
    if (error) {
      setValidationError(error);

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setValidationError(null);
      }, 3000);

      return;
    }

    try {
      const payload = { ...formState };
      // Default to current user name if empty (creation), otherwise keep existing (edit)
      if (!payload.mediaOwnerName && user?.name) {
        payload.mediaOwnerName = user.name;
      }

      if (editingId) {
        await editMedia(editingId, payload);
      } else {
        await addNewMedia(payload);
      }
      setIsModalOpen(false);
      resetForm();
      setEditingId(null);
      notifications.show({
        title: t("notifications.createSuccess.title"),
        message: t("notifications.createSuccess.message"),
        color: "green",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setValidationError(message);
    }
  };

  const handleEdit = async (id: string | number) => {
    try {
      const backend = await fetchMediaById(id);
      // Map backend DTO to MediaFormState shape
      const schedule = backend.schedule || {
        selectedMonths: [],
        weeklySchedule: [],
      };

      const activeDaysOfWeek: Record<string, boolean> = {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      };

      const dailyOperatingHours: Record<
        string,
        { start: string; end: string }
      > = {
        Monday: { start: "00:00", end: "00:00" },
        Tuesday: { start: "00:00", end: "00:00" },
        Wednesday: { start: "00:00", end: "00:00" },
        Thursday: { start: "00:00", end: "00:00" },
        Friday: { start: "00:00", end: "00:00" },
        Saturday: { start: "00:00", end: "00:00" },
        Sunday: { start: "00:00", end: "00:00" },
      };

      if (schedule.weeklySchedule) {
        schedule.weeklySchedule.forEach((entry: any) => {
          // entry.dayOfWeek is likely "monday". We need "Monday"
          const dayKey =
            entry.dayOfWeek.charAt(0).toUpperCase() + entry.dayOfWeek.slice(1);
          if (activeDaysOfWeek.hasOwnProperty(dayKey)) {
            activeDaysOfWeek[dayKey] = entry.isActive;
            dailyOperatingHours[dayKey] = {
              start: entry.startTime ?? "00:00",
              end: entry.endTime ?? "00:00",
            };
          }
        });
      }

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
      months.forEach(
        (m) => (activeMonths[m] = (schedule.selectedMonths || []).includes(m))
      );

      // populate the form
      setFormState({
        mediaTitle: backend.title ?? "",
        mediaOwnerName: backend.mediaOwnerName ?? "",
        resolution: backend.resolution ?? "",
        displayType: backend.typeOfDisplay ?? null,
        loopDuration:
          backend.loopDuration != null ? String(backend.loopDuration) : "",
        aspectRatio: backend.aspectRatio ?? "",
        widthCm: backend.width != null ? String(backend.width) : "",
        heightCm: backend.height != null ? String(backend.height) : "",
        weeklyPrice: backend.price != null ? String(backend.price) : "",
        dailyImpressions:
          backend.dailyImpressions != null
            ? String(backend.dailyImpressions)
            : "",
        mediaAddress: backend.address ?? "",
        activeDaysOfWeek,
        dailyOperatingHours,
        activeMonths,
      });

      setEditingId(String(id));
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch media for edit:", err);
      alert(t("errors.loadFailed"));
    }
  };

  const handleDelete = (id: string | number) => {
    modals.openConfirmModal({
      title: t("deleteConfirm.title"),
      centered: true,
      children: t("deleteConfirm.message"),
      labels: {
        confirm: t("deleteConfirm.confirm"),
        cancel: t("deleteConfirm.cancel"),
      },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteMediaById(id);
        } catch (err) {
          console.error("Failed to delete media:", err);
          alert(t("errors.deleteFailed"));
        }
      },
    });
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
        label={t("sidebar.overview")}
        leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}
        active={pathname?.includes("/overview")}
        onClick={isMobile ? close : undefined}
      />
      <NavLink
        component={Link}
        href="/dashboard"
        label={t("sidebar.media")}
        leftSection={<IconDeviceTv size={20} stroke={1.5} />}
        active={pathname === "/dashboard" || pathname?.endsWith("/dashboard")}
        onClick={isMobile ? close : undefined}
      />
      <NavLink
        component={Link}
        href="/dashboard/displayed-ads"
        label={t("sidebar.displayedAds")}
        leftSection={<IconAd size={20} stroke={1.5} />}
        active={pathname?.includes("/displayed-ads")}
        onClick={isMobile ? close : undefined}
      />
      <NavLink
        component={Link}
        href="/dashboard/ad-requests"
        label={t("sidebar.adRequests")}
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
        label={t("sidebar.transactions")}
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
              <Button
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                  setValidationError(null);
                  // Pre-populate owner name for new media
                  if (user?.name) {
                    setFormState((prev) => ({ ...prev, mediaOwnerName: user.name ?? "" }));
                  }
                  setIsModalOpen(true);
                }}
              >
                Add new media
              </Button>
            </Group>
            <MediaModal
              opened={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setEditingId(null);
                resetForm();
                setValidationError(null);
              }}
              onSave={handleSave}
              formState={formState}
              onFieldChange={updateField}
              onDayTimeChange={updateDayTime}
              error={validationError}
            />

            <MediaTable
              rows={paginatedMedia}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
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
        </Group >
      </Box >
    </>
  );
}
