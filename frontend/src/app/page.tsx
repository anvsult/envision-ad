"use client";

import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Box,
} from "@mantine/core";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Partners } from "@/components/Partners";
import classes from "./page.module.css";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <NavBar />

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
        {/* TODO Make these margin & padding values responsive instead of hard-coded */}
        <Container
          size="xl"
          ml={{ base: 20, sm: 40, md: 80, lg: 160 }}
          py={{ base: 40, sm: 60, md: 80 }}
          style={{ position: "relative", zIndex: 1 }}
        >
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
                Discover affordable, high-impact advertising opportunities in your city.
                Connect with local audiences through unique ad spaces and make your brand unforgettable.
                Our platform makes it easy to browse, book, and manage ad placements that fit your budget and goals.
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
        </Container>
      </Box>

      {/* Partners Section */}
      <Container size="xl" py={40}>
        <Partners />
      </Container>
    </>
  );
}
