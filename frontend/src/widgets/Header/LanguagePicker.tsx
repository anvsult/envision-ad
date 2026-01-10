import { useTransition } from "react";
import { Button, Group, Text } from "@mantine/core";
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
      <Button
          onClick={handleToggle}
          disabled={isPending}
          variant="subtle"
          radius="xl"
          px="xs"
          aria-label="Switch language"
          leftSection={
            <Image src={current.image} width={20} height={20} alt={current.alt} />
          }
          styles={{
            root: {
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(0,0,0,0.1)",
              color: "var(--mantine-color-gray-7)",
            },
          }}
      >
        <Group gap={4}>
          <Text size="sm" fw={600}>
            {current.label}
          </Text>
        </Group>
      </Button>
  );
}
