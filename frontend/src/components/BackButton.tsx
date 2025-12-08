"use client";


import { ActionIcon } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";


export function BackButton() {
  const router = useRouter();


  return (
    <ActionIcon
      variant="subtle"
      radius="xl"
      size="lg"
      onClick={() => router.push("/browse")}
    >
      <IconArrowLeft size={20} />
    </ActionIcon>
  );
}
