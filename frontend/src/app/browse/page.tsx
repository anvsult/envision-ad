'use client';

import { Container, Title, Text, Stack } from '@mantine/core';
import { NavBar } from '@/components/NavBar';

export default function BrowsePage() {
  return (
    <>
      <NavBar />
      <Container size="xl" py={60}>
        <Stack gap="xl">
          <Title order={1} size="h1" fw={700}>
            Browse Ad Spaces
          </Title>
          <Text size="lg" c="gray.7">
            Coming soon...
          </Text>
        </Stack>
      </Container>
    </>
  );
}