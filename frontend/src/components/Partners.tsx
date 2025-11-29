"use client";

import { Stack, Title, Text, Group } from "@mantine/core";
import classes from "./Partners.module.css";
import Image from "next/image";
export function Partners() {
  return (
    <Stack gap="xl" py={60} className={classes.partnersSection}>
      <Title order={2} size="h2" fw={700}>
        Partners
      </Title>

      <Group gap="xl" justify="flex-start">
        {/* Partner logo - using the same Visual Impact logo as placeholder */}
        <div className={classes.partnerLogo}>
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
          <Text size="md" fw={700} c="blue.8" mt="xs">
            VISUAL IMPACT
          </Text>
        </div>
      </Group>
    </Stack>
  );
}
