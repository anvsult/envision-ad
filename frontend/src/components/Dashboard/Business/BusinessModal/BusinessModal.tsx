"use client";

import React, { useState } from "react";
import { Modal, Button, Group, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";
import { BusinessDetailsForm } from "./BusinessDetailsForm";
import { BusinessRequest } from "@/types/BusinessTypes";
import { createBusiness, updateBusiness } from "@/services/BusinessService";

interface BusinessModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formState: BusinessRequest;
  onFieldChange: <K extends keyof BusinessRequest>(
    field: K,
    value: BusinessRequest[K]
  ) => void;
  resetForm: () => void;
  editingId?: string | null;
}

export function BusinessModal({
  opened,
  onClose,
  onSuccess,
  formState,
  onFieldChange,
  resetForm,
  editingId,
}: BusinessModalProps) {
  const t = useTranslations("business.form");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await updateBusiness(editingId, formState);
      } else {
        await createBusiness(formState);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to save business", error);
      alert(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingId ? "Edit Business" : t("title")}
      size="lg"
    >
      <Stack gap="md">
        <BusinessDetailsForm
          formState={formState}
          onFieldChange={onFieldChange}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {editingId ? "Update" : t("submit")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
