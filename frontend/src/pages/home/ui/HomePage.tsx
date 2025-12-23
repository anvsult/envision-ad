import { Container, Stack, Title, Text, Button, Box } from "@mantine/core";
import Link from "next/link";
import { Header } from "@/components/Header/Header";
import { Partners } from "@/components/Partners/Partners";
import classes from "@/app/page.module.css";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("homepage");

  return (
    <>
      {/* Hero Section */}
      <Box className={classes.hero}>
        {/* Background Image */}
        <Box
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
          visibleFrom="sm"
        >
          <Image
            src="/images/image-homepage-background.png"
            alt={t("images.backgroundImage.alt")}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>

        {/* Content on top of background */}
        <Container
          // This adjusts the size of the text on the hero page to be responsive
          size="lg"
          ml={{ base: 20, sm: 20, md: 60, lg: 80 }}
          py={{ base: 40, sm: 60, md: 80 }}
          pr={{ base: 30, sm: 700, md: 600 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Stack gap="xl">
            <Stack gap="md">
              <Title order={1} size="h1" fw={700} className={classes.heroTitle}>
                {t("heroTitlePart1")}
              </Title>
              <Title order={1} size="h1" fw={700} className={classes.heroTitle}>
                {t("heroTitlePart2")}
              </Title>
            </Stack>

            <Text size="lg" c="gray.7" className={classes.heroDescription}>
              {t("heroDescription")}
            </Text>

            <Box className={classes.ctaSection}>
              <Title order={3} size="h3" fw={700} mb="md">
                {t("ctaTitle")}
              </Title>
              <Link href="/browse">
                <Button
                  size="lg"
                  radius="md"
                  color="blue.6"
                  className={classes.ctaButton}
                >
                  {t("ctaBrowse")}
                </Button>
              </Link>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Partners Section */}
      <Box py={40}>
        <Partners />
      </Box>
    </>
  );
}
