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
  Menu
} from "@mantine/core";
import classes from "./Header.module.css";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useDisclosure } from "@mantine/hooks";
import { LanguagePicker } from "./LanguagePicker";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { IconChevronDown } from '@tabler/icons-react';

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
  const { user, isLoading } = useUser();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const items = (
      <>
        <Link
            key={t("home")}
            href={"/"}
            className={classes.link}
            data-active={pathname === "/" || undefined}
            onClick={closeDrawer}
        >
          {t("home")}
        </Link>
        { user &&
            <Link
                key={t("dashboard")}
                href={"/dashboard"}
                className={classes.link}
                data-active={pathname.includes("/dashboard") || undefined}
                onClick={closeDrawer}
            >
              {t("dashboard")}
            </Link>
        }
        <Link
            key={t("browse")}
            href={"/browse"}
            className={classes.link}
            data-active={pathname === "/browse" || undefined}
            onClick={closeDrawer}
        >
          {t("browse")}
        </Link>
      </>
  )

  const authButtons = (
    <>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/auth/login?screen_hint=signup" className={classes.navLink}>
        <Button variant="outline" color="blue.6" radius="xl">
          {t("register")}
        </Button>
      </a>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}  
      <a href="/auth/login" className={classes.navLink}>
        <Button variant="filled" color="blue.8" radius="xl">
          {t("signIn")}
        </Button>
      </a>
    </>
  );

  const userMenu = user && (
    <Menu shadow="md" width={200} withinPortal={false}>
      <Menu.Target>
        <Button variant="outline" radius="xl" rightSection={<IconChevronDown size={16} />}>
          {user.nickname || user.name || "User"}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item component="a" href="/profile">
          {t("profile")}
        </Menu.Item>
        <Menu.Item component="a" href="/auth/logout" color="red">
          {t("logout")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  if (isLoading) {
    return null;
  }

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
          <Group visibleFrom="md" gap="sm">
            <LanguagePicker />
            {user ? userMenu : authButtons}
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
                  {user ? userMenu : authButtons}
              </Group>
            </ScrollArea>
          </Drawer>
      )}
    </Box>
  );
}
