"use client";

import React, { useState } from "react";
import { Stack, Button, Group, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { BusinessTable } from "./BusinessTable/BusinessTable";
import { BusinessModal } from "@/features/business-management/ui";
import {
  useBusinessList,
  useBusinessForm,
} from "@/features/business-management/model";
import { CompanySize } from "@/entities/businesses/model";

export function BusinessDashboard() {
  const t = useTranslations("business");
  const {
    businesses,
    refreshBusinesses,
    fetchBusinessById,
    editBusiness,
    deleteBusinessById,
  } = useBusinessList();
  const { formState, updateField, resetForm, setFormState } = useBusinessForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = async (id: string | number) => {
    try {
      const business = await fetchBusinessById(id);

      // Map BusinessResponse to BusinessRequest format
      setFormState({
        name: business.name ?? "",
        companySize:
          (typeof business.companySize === "string"
            ? CompanySize[business.companySize as keyof typeof CompanySize]
            : business.companySize) ?? CompanySize.SMALL,
        street: business.address?.street ?? "",
        city: business.address?.city ?? "",
        state: business.address?.state ?? "",
        zipCode: business.address?.zipCode ?? "",
        country: business.address?.country ?? "",
      });

      setEditingId(String(id));
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch businesses for edit:", err);
      alert("Failed to load businesses for editing");
    }
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = confirm("Are you sure you want to delete this businesses?");
    if (!confirmed) return;
    try {
      await deleteBusinessById(id);
    } catch (err) {
      console.error("Failed to delete businesses:", err);
      alert("Failed to delete businesses");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between">
        <Title order={2}>{t("title")}</Title>
        <Button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setIsModalOpen(true);
          }}
        >
          {t("createButton")}
        </Button>
      </Group>

      <BusinessTable
        rows={businesses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BusinessModal
        opened={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={refreshBusinesses}
        formState={formState}
        onFieldChange={updateField}
        resetForm={resetForm}
        editingId={editingId}
      />
    </Stack>
  );
}
