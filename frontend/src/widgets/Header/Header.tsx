"use client";

import {
    Group,
    Stack,
    Button,
    Text,
    Box,
    Drawer,
    ScrollArea,
    Divider,
    Burger,
    Menu,
    NavLink,
} from "@mantine/core";
import SideBar from "@/widgets/SideBar/SideBar";
import React, { useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useDisclosure } from "@mantine/hooks";
import { LanguagePicker } from "./LanguagePicker";
import { Link, usePathname } from "@/shared/lib/i18n/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { IconChevronDown } from "@tabler/icons-react";

export function Header() {
    const locale = useLocale();
    const t = useTranslations("nav");
    const pathname = usePathname();
    const { user } = useUser();

    const links: Array<{
        link: "/" | "/dashboard" | "/browse";
        label: string;
        authRequired?: boolean;
    }> = [
            { link: "/", label: t("home"), authRequired: false },
            { link: "/dashboard", label: t("dashboard"), authRequired: true },
            { link: "/browse", label: t("browse"), authRequired: false },
        ];

    const filteredLinks = links.filter((link) => {
        return !(link.authRequired && !user);

    });

    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
        useDisclosure(false);

    useEffect(() => {
        closeDrawer();
    }, [pathname, closeDrawer]);

    const mobileItems = filteredLinks.map((link) => {
        if (link.link === "/dashboard") {
            return (
                <NavLink
                    key={link.label}
                    label={link.label}
                    childrenOffset={16}
                    defaultOpened={false}
                    styles={{
                        label: { fontWeight: 500 },
                        root: { borderRadius: 12 }
                    }}
                >
                    <SideBar />
                </NavLink>
            );
        }

        const active = pathname === link.link || pathname.startsWith(link.link + '/');
        return (
            <Link
                key={link.label}
                href={link.link}
                style={{
                    textDecoration: "none",
                    color: active ? "var(--mantine-color-blue-6)" : "inherit",
                    fontWeight: active ? 600 : 500,
                    padding: "8px 12px",
                    borderRadius: 12,
                    transition: "background-color .15s ease",
                    display: "block" // Ensure it takes width
                }}
            >
                {link.label}
            </Link>
        );
    });

    const desktopItems = filteredLinks.map((link) => {
        const active = pathname === link.link || pathname.startsWith(link.link + '/');
        return (
            <Link
                key={link.label}
                href={link.link}
                style={{
                    textDecoration: "none",
                    color: active ? "var(--mantine-color-blue-6)" : "inherit",
                    fontWeight: active ? 600 : 500,
                    padding: "8px 12px",
                    borderRadius: 12,
                    transition: "background-color .15s ease",
                }}
            >
                {link.label}
            </Link>
        );
    });

    const authButtons = (
        <Group gap="sm">
            <a href={`/auth/login?ui_locales=${locale}&screen_hint=signup`} style={{ textDecoration: "none" }}>
                <Button variant="outline" color="blue.6" radius="xl">
                    {t("register")}
                </Button>
            </a>
            <a href={`/auth/login?ui_locales=${locale}`} style={{ textDecoration: "none" }}>
                <Button variant="filled" color="blue.8" radius="xl">
                    {t("signIn")}
                </Button>
            </a>
        </Group>
    );

    const userMenu = user && (
        <Menu shadow="md" width={200} withinPortal={false}>
            <Menu.Target>
                <Button
                    variant="outline"
                    radius="xl"
                    rightSection={<IconChevronDown size={16} />}
                >
                    <Text component="span">{user.nickname || user.name || "User"}</Text>
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

    return (
        <Box>
            <Box
                component="header"
                style={{
                    top: 0,
                    zIndex: 1000,
                    width: "100%",
                    background: "var(--mantine-color-body)",
                    borderBottom: "1px solid var(--mantine-color-gray-3)",
                    padding: "12px 16px",
                }}
            >
                <Group justify="space-between" h="100%">
                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <Group gap="xl">
                            <Box
                                style={{
                                    width: 50,
                                    height: 50,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Image
                                    src="/images/logo-envision-ad.png"
                                    alt={t("images.envisionAdLogo.alt")}
                                    width={50}
                                    height={50}
                                    style={{ objectFit: "contain" }}
                                    priority
                                />
                            </Box>
                            <Text size="lg" fw={700} c="blue.6">
                                {t("platformName")}
                            </Text>
                        </Group>
                    </Link>

                    {/* Navigation */}
                    <Group gap="md" visibleFrom="sm">
                        {desktopItems}
                    </Group>

                    {/* Auth Buttons - no loading state needed! */}
                    <Group visibleFrom="md" gap="sm" align="center">
                        <LanguagePicker />
                        {user ? userMenu : authButtons}
                    </Group>

                    {/* Burger menu */}
                    <Burger
                        opened={drawerOpened}
                        onClick={toggleDrawer}
                        hiddenFrom="md"
                        aria-label="Toggle navigation"
                    />
                </Group>
            </Box>

            {/* Navigation drawer */}
            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title={
                    <Group justify="space-between" align="center" style={{ width: "100%" }}>
                        <Text fw={700}>Navigation</Text>
                        <LanguagePicker />
                    </Group>
                }
                hiddenFrom="md"
                zIndex={1000000}
            >
                <ScrollArea h="calc(100vh - 80px)" mx="-md">
                    <Divider my="sm" />

                    <Box hiddenFrom="sm">
                        <Stack px="md">
                            {mobileItems}
                        </Stack>
                        <Divider my="sm" />
                    </Box>

                    <Group justify="center" grow pb="xl" px="md">
                        {user ? userMenu : authButtons}
                    </Group>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}