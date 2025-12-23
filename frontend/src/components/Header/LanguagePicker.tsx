"use client";

import { useTransition } from "react";
import { Group, UnstyledButton, Text } from "@mantine/core";
import classes from "./LanguagePicker.module.css";
import { useRouter, usePathname } from "@/shared/lib/i18n/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";

const locales = [
  { image: "/images/english.png", locale: "en", alt: "English", label: "EN" },
  { image: "/images/french.png", locale: "fr", alt: "Français", label: "FR" },
];

export function LanguagePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextLocale = currentLocale === "en" ? "fr" : "en";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const current =
    locales.find((item) => item.locale === currentLocale) || locales[0];

  return (
    <UnstyledButton
      onClick={handleToggle}
      disabled={isPending}
      className={classes.switchButton}
      aria-label="Switch language"
    >
      <Group gap="xs">
        <Image src={current.image} width={20} height={20} alt={current.alt} />
        <Text size="sm" fw={600}>
          {current.label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}
