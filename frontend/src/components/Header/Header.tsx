"use client";

import {
  Group,
  Button,
  Text,
  Box,
  Drawer,
  ScrollArea,
  Divider,
  Burger,
} from "@mantine/core";
import classes from "./Header.module.css";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useDisclosure } from "@mantine/hooks";
import { LanguagePicker } from "./LanguagePicker";
import { Link, usePathname } from "@/i18n/navigation";

// When in dashboard on small screen, the burger menu shows dashboard menus instead of header menus
interface HeaderProps {
  dashboardMode?: boolean;
  sidebarOpened?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({
  dashboardMode = false,
  sidebarOpened = false,
  onToggleSidebar,
}: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const links: Array<{ link: "/" | "/dashboard" | "/browse"; label: string }> =
    [
      { link: "/", label: t("home") },
      { link: "/dashboard", label: t("dashboard") },
      { link: "/browse", label: t("browse") },
    ];
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={pathname === link.link || undefined}
      onClick={closeDrawer}
    >
      {link.label}
    </Link>
  ));

  const authButtons = (
    <>
      <Link href="/register" className={classes.navLink}>
        <Button variant="outline" color="blue.6" radius="xl" fullWidth>
          {t("register")}
        </Button>
      </Link>
      <Link href="/signin" className={classes.navLink}>
        <Button variant="filled" color="blue.6" radius="xl" fullWidth>
          {t("signIn")}
        </Button>
      </Link>
    </>
  );

  return (
    <Box>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          {/* Logo */}
          <Link href="/" className={classes.logoLink}>
            <Group gap="xl">
              <div className={classes.logoImageWrapper}>
                <Image
                  src="/images/logo-envision-ad.png"
                  alt={t("images.envisionAdLogo.alt")}
                  width={50}
                  height={50}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <Text size="lg" fw={700} c="blue.6" className={classes.logoText}>
                {t("platformName")}
              </Text>
            </Group>
          </Link>

          {/* Navigation */}
          <Group gap="md" visibleFrom="sm">
            {items}
          </Group>

          {/* Auth Buttons */}
          <Group visibleFrom="md">
            <LanguagePicker />
            <Link href="/register" className={classes.navLink}>
              <Button variant="outline" color="blue.6" radius="xl">
                {t("register")}
              </Button>
            </Link>
            <Link href="/signin" className={classes.navLink}>
              <Button variant="filled" color="blue.6" radius="xl">
                {t("signIn")}
              </Button>
            </Link>
          </Group>

          {/* Burger menu - shows sidebar toggle in dashboard mode, otherwise shows navigation drawer */}
          <Burger
            opened={dashboardMode ? sidebarOpened : drawerOpened}
            onClick={dashboardMode ? onToggleSidebar : toggleDrawer}
            hiddenFrom={dashboardMode ? "md" : "md"}
            aria-label={dashboardMode ? "Toggle sidebar" : "Toggle navigation"}
          />
        </Group>
      </header>

      {/* Only show navigation drawer when NOT in dashboard mode */}
      {!dashboardMode && (
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="100%"
          padding="md"
          title="Navigation"
          hiddenFrom="md"
          zIndex={1000000}
        >
          <ScrollArea h="calc(100vh - 80px)" mx="-md">
            <Divider my="sm" />

            <Box hiddenFrom="sm">
              {items}
              <Divider my="sm" />
            </Box>

            <Group justify="center" pb="md" px="md">
              <LanguagePicker />
            </Group>

            <Group justify="center" grow pb="xl" px="md">
              {authButtons}
            </Group>
          </ScrollArea>
        </Drawer>
      )}
    </Box>
  );
}
