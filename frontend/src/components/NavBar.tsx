"use client";

import { Group, Container, Button, Text } from "@mantine/core";
import Link from "next/link";
import classes from "./NavBar.module.css";
import Image from "next/image";

export function NavBar() {
  return (
    <header className={classes.header}>
      <Container size="xl" className={classes.inner}>
        <Group justify="space-between" h="100%">
          {/* Logo */}
          <Link href="/" className={classes.logoLink}>
            <Group gap="xs">
              <div className={classes.logoImageWrapper}>
                <Image
                  src="/images/visualimpact.png"
                  alt="Visual Impact Logo"
                  width={80}
                  height={80}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <Text
                size="lg"
                fw={700}
                c="deepBlue.8"
                className={classes.logoText}
              >
                VISUAL IMPACT
              </Text>
            </Group>
          </Link>

          {/* Navigation */}
          <Group gap="md">
            <Link href="/" className={classes.navLink}>
              <Button variant="subtle" c="gray.8" className={classes.navButton}>
                Home
              </Button>
            </Link>
            <Link href="/browse" className={classes.navLink}>
              <Button variant="subtle" c="gray.8" className={classes.navButton}>
                Browse
              </Button>
            </Link>

            {/* Auth Buttons */}
            <Link href="/register" className={classes.navLink}>
              <Button variant="outline" color="blue.6" radius="xl">
                Register
              </Button>
            </Link>
            <Link href="/signin" className={classes.navLink}>
              <Button variant="filled" color="blue.8" radius="xl">
                Sign In
              </Button>
            </Link>
          </Group>
        </Group>
      </Container>
    </header>
  );
}
