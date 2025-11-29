"use client";

import {
  Container,
  Grid,
  Stack,
  Title,
  Text,
  Button,
  Box,
} from "@mantine/core";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Partners } from "@/components/Partners";
import classes from "./page.module.css";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <Box className={classes.hero}>
        {/* Background Image */}
        <Box style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/images/homepage-eye-image.png"
            alt="Eye background image, representing visual impact"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>

        {/* Content on top of background */}
        <Container
          size="xl"
          pl={0}
          ml={160}
          py={80}
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* <Grid gutter="xl" align="center">
      {/* Left Column - Text Content */}
          {/* <Grid.Col span={{ base: 12, md: 6 }}> */}
          <Stack gap="xl">
            <Stack gap="md">
              <Title order={1} size="h1" fw={700} className={classes.heroTitle}>
                Affordable ads.
              </Title>
              <Title order={1} size="h1" fw={700} className={classes.heroTitle}>
                Unforgettable impact.
              </Title>
            </Stack>

            <Text size="lg" c="gray.7" className={classes.heroDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Text>

            <Box className={classes.ctaSection}>
              <Title order={3} size="h3" fw={700} mb="md">
                Find Ad Spaces Now
              </Title>
              <Link href="/browse">
                <Button
                  size="lg"
                  radius="md"
                  color="blue.6"
                  className={classes.ctaButton}
                >
                  Browse
                </Button>
              </Link>
            </Box>
          </Stack>
          {/* </Grid.Col>
    </Grid> */}
        </Container>
      </Box>

      {/* Partners Section */}
      <Container size="xl" py={40}>
        <Partners />
      </Container>
    </>
  );
}
