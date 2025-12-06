import {
  Group,
  Container,
  Button,
  Text,
  Box,
  Drawer,
  ScrollArea,
  Divider,
  Burger,
} from "@mantine/core";
import { useState } from "react";
import Link from "next/link";
import classes from "./Header.module.css";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useDisclosure } from "@mantine/hooks";

const links = [
  { link: "/home", label: "Home" },
  { link: "/dashboard", label: "Dashboard" },
  { link: "/browse", label: "Browse" },
];

export function Header() {
  const t = useTranslations("nav");
  const [active, setActive] = useState(links[0].link);
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
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
                  alt="Visual Impact Logo"
                  width={50}
                  height={50}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <Text size="lg" fw={700} c="blue.6" className={classes.logoText}>
                Envision Ad
              </Text>
            </Group>
          </Link>

          {/* Navigation */}
          <Group gap="md" visibleFrom="sm">
            {items}
          </Group>

          {/* Auth Buttons */}
          <Group visibleFrom="md">
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

          <Group justify="center" grow pb="xl" px="md">
            {authButtons}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
