"use client";

import { Card, Text, Group, Avatar, Stack, Badge, ThemeIcon, Title, Box, Divider, Paper, ActionIcon, Button } from "@mantine/core";
import { IconUser, IconBuildingStore, IconMail, IconMapPin, IconBriefcase, IconPencil, IconPhone, IconArrowLeft } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

interface ProfileContentProps {
    user: any;
}

export default function ProfileContent({ user }: ProfileContentProps) {
    const t = useTranslations("profilePage");

    // Helper helper to ensure strings
    const safeStr = (val: any, fallback = "") => typeof val === 'string' ? val : diffType(val, fallback);
    const diffType = (val: any, fallback: string) => val ? String(val) : fallback;

    const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <Group justify="space-between" align="center" py="xs">
            <Stack gap={2}>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">{label}</Text>
                <Text size="sm" fw={500} component="div">{value}</Text>
            </Stack>
        </Group>
    );

    return (
        <Stack gap="lg">
            <Group>
                <Button
                    component={Link}
                    href="/"
                    variant="subtle"
                    color="gray"
                    leftSection={<IconArrowLeft size={16} />}
                >
                    {t("backToHome")}
                </Button>
            </Group>
            <Title order={1}>{t("title")}</Title>
            <Paper radius="md" withBorder shadow="sm" pos="relative" style={{ overflow: "hidden" }}>
                {/* Banner Section */}
                <Box h={140} bg="var(--mantine-color-blue-filled)" style={{ width: '100%' }} />

                <Stack px="xl" pb="xl">
                    {/* Header with Avatar and Main Info - Overlapping Banner */}
                    <Group justify="space-between" align="flex-end" mt="-40px" mb="md">
                        <Group align="flex-end">
                            <Avatar
                                src={user.picture}
                                alt={safeStr(user.name, "User")}
                                size={120}
                                radius="100%"
                                style={{ border: '6px solid var(--mantine-color-body)' }}
                            />
                            <Box pb="xs">
                                <Title order={2}>{safeStr(user.name)}</Title>
                                <Text c="dimmed" size="sm"> EnvisionAd Member</Text>
                            </Box>
                        </Group>
                    </Group>

                    {/* Main Content Sections */}
                    <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
                        {/* Personal Information Section */}
                        <Box>
                            <Title order={4} mb="xs" size="h5" tt="uppercase" c="dimmed">{t("personalInfo.title")}</Title>
                            <Stack gap="xs">
                                <InfoRow
                                    label="USERNAME"
                                    value={safeStr(user.nickname || user.name)}
                                />
                                <Divider variant="dashed" />
                                <InfoRow
                                    label="EMAIL"
                                    value={
                                        <Group gap="xs">
                                            {safeStr(user.email)}
                                            {user.email_verified && <Badge size="xs" color="green" variant="light">Verified</Badge>}
                                        </Group>
                                    }
                                />
                                <Divider variant="dashed" />
                                <InfoRow
                                    label={t("personalInfo.firstName").toUpperCase()}
                                    value={safeStr(user.given_name, "-")}
                                />
                                <Divider variant="dashed" />
                                <InfoRow
                                    label={t("personalInfo.lastName").toUpperCase()}
                                    value={safeStr(user.family_name, "-")}
                                />
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Paper>
        </Stack>
    );
}
