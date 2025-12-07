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

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const links = [
    { link: "/", label: t("home") },
    { link: "/dashboard", label: t("dashboard") },
    { link: "/browse", label: t("browse") },
  ];
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link as any}
      className={classes.link}
      data-active={pathname === link.link || undefined}
      onClick={closeDrawer}
    >
      {link.label}
    </Link>
  ));

  const authButtons = (
    <>
      <a href="/auth/login?screen_hint=signup" className={classes.navLink}>
        <Button variant="outline" color="blue.6" radius="xl">
          {t("register")}
        </Button>
      </a>

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
        <Button variant="outline" radius="xl" rightSection={<span>▼</span>}>
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

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="md"
          />
        </Group>
      </header>

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
    </Box>
  );
}
