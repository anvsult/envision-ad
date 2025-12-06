import { Container, Title, Text, Stack } from "@mantine/core";
import { Header } from "@/components/Header/Header";

export default function BrowsePage() {
  return (
    <>
      <Header />
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
